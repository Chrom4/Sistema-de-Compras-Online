import { createCrudRouter } from "./_crudFactory.js";
import { pool } from "../config/database.js";

export const carrinhoRouter = createCrudRouter({ tableName: "carrinho" });

carrinhoRouter.get("/cliente/:id", async (req, res) => {
  const codigoCliente = req.params.id;

  try {
    // Fazemos um JOIN ligando: Cliente -> Conta -> Carrinho -> Itens -> Produtos
    // (Ajuste os campos 'p.nome' e 'p.preco' conforme as colunas reais da sua tabela de produtos)
    const [itensRows] = await pool.query(
      `SELECT 
        ic.codigo AS item_codigo, 
        ic.quantidade, 
        ic.codigo_produto,
        p.nome AS produto_nome,
        p.preco AS produto_preco
      FROM conta c
      INNER JOIN carrinho car ON car.codigo_conta = c.codigo
      INNER JOIN item_carrinho ic ON ic.codigo_carrinho = car.codigo
      INNER JOIN produto p ON p.codigo = ic.codigo_produto
      WHERE c.codigo_cliente = ?`,
      [codigoCliente],
    );

    // Se itensRows vier vazio ([]), significa que o cliente não tem carrinho ou o carrinho está vazio.
    // Isso é um estado válido, então retornamos 200 com a lista vazia.
    return res.status(200).json({
      success: true,
      items: itensRows,
    });
  } catch (error) {
    console.error("Erro ao buscar carrinho do cliente:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao buscar o carrinho.",
      error: error.message,
    });
  }
});

carrinhoRouter.post("/adicionar", async (req, res) => {
  const { codigoProduto, codigoCliente, quantidade = 1 } = req.body ?? {};

  if (!codigoProduto || !codigoCliente) {
    return res.status(400).json({
      success: false,
      message: "codigoProduto e codigoCliente são obrigatórios.",
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [contaRows] = await connection.query(
      "SELECT codigo FROM conta WHERE codigo_cliente = ? LIMIT 1",
      [codigoCliente],
    );

    if (!contaRows.length) {
      return res.status(404).json({
        success: false,
        message: "Nenhuma conta encontrada para esse cliente.",
      });
    }

    const codigoConta = contaRows[0].codigo;

    const [carrinhoRows] = await connection.query(
      "SELECT codigo FROM carrinho WHERE codigo_conta = ? LIMIT 1",
      [codigoConta],
    );

    let codigoCarrinho = carrinhoRows[0]?.codigo;

    if (!codigoCarrinho) {
      const [carrinhoResult] = await connection.query(
        "INSERT INTO carrinho (codigo_conta) VALUES (?)",
        [codigoConta],
      );
      codigoCarrinho = carrinhoResult.insertId;
    }

    const [itemRows] = await connection.query(
      "SELECT codigo, quantidade FROM item_carrinho WHERE codigo_carrinho = ? AND codigo_produto = ? LIMIT 1",
      [codigoCarrinho, codigoProduto],
    );

    if (itemRows.length > 0) {
      await connection.query(
        "UPDATE item_carrinho SET quantidade = quantidade + ? WHERE codigo = ?",
        [quantidade, itemRows[0].codigo],
      );
    } else {
      await connection.query(
        "INSERT INTO item_carrinho (codigo_carrinho, codigo_produto, quantidade) VALUES (?, ?, ?)",
        [codigoCarrinho, codigoProduto, quantidade],
      );
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Produto adicionado ao carrinho.",
      codigoCarrinho,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Erro ao adicionar ao carrinho:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao adicionar ao carrinho.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
});
