import { createCrudRouter } from "./_crudFactory.js";
import { pool } from "../config/database.js";
import { Router } from "express";

export const pedidoRouter = createCrudRouter({
  tableName: "pedido",
  methodsToExclude: ["get"],
});

pedidoRouter.post("/finalizar", async (req, res) => {
  const { codigoCliente, itens = [] } = req.body ?? {};

  if (!codigoCliente) {
    return res
      .status(400)
      .json({ success: false, message: "codigoCliente é obrigatório." });
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
    if (!carrinhoRows.length) {
      return res.status(404).json({
        success: false,
        message: "Nenhum carrinho encontrado para esse cliente.",
      });
    }

    const codigoCarrinho = carrinhoRows[0].codigo;

    const selectedItens = itens.length
      ? itens
      : (
          await connection.query(
            "SELECT codigo, codigo_produto, quantidade FROM item_carrinho WHERE codigo_carrinho = ?",
            [codigoCarrinho],
          )
        )[0];

    if (!selectedItens.length) {
      return res.status(400).json({
        success: false,
        message: "Selecione ao menos um item para finalizar a compra.",
      });
    }

    const idsParaBuscar = selectedItens.map((item) => {
      return item.codigo || item.item_codigo || item;
    });

    const [produtosRows] = await connection.query(
      `SELECT ic.codigo AS item_codigo, ic.codigo_produto, ic.quantidade, p.preco
        FROM item_carrinho ic
        JOIN produto p ON p.codigo = ic.codigo_produto
        WHERE ic.codigo_carrinho = ? AND ic.codigo IN (?)`,
      [codigoCarrinho, idsParaBuscar],
    );

    if (!produtosRows.length) {
      return res.status(400).json({
        success: false,
        message: "Itens selecionados não encontrados no carrinho.",
      });
    }

    const valorTotal = produtosRows.reduce(
      (acc, item) => acc + Number(item.quantidade) * Number(item.preco),
      0,
    );

    const [pedidoResult] = await connection.query(
      "INSERT INTO pedido (codigo_conta, valor, status, data_pedido) VALUES (?, ?, ?, CURDATE())",
      [codigoConta, valorTotal, "em processamento"],
    );

    const codigoPedido = pedidoResult.insertId;

    await connection.query(
      "INSERT INTO item_pedido (codigo_pedido, codigo_produto, quantidade) VALUES ?",
      [
        produtosRows.map((item) => [
          codigoPedido,
          item.codigo_produto,
          item.quantidade,
        ]),
      ],
    );

    const itemIds = produtosRows.map((item) => item.item_codigo);
    if (itemIds.length) {
      await connection.query("DELETE FROM item_carrinho WHERE codigo IN (?)", [
        itemIds,
      ]);
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Pedido criado com sucesso.",
      codigoPedido,
      valorTotal,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Erro ao finalizar compra:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao finalizar compra.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

// GET pedidos by cliente
pedidoRouter.get("/cliente/:codigoCliente", async (req, res) => {
  const { codigoCliente } = req.params;

  try {
    const [pedidosRows] = await pool.query(
      `SELECT 
        p.codigo AS pedido_codigo,
        p.valor,
        p.status,
        p.data_pedido,
        ip.quantidade,
        prod.nome AS produto_nome,
        prod.preco AS produto_preco
      FROM pedido p
      INNER JOIN conta c ON c.codigo = p.codigo_conta
      INNER JOIN item_pedido ip ON ip.codigo_pedido = p.codigo
      INNER JOIN produto prod ON prod.codigo = ip.codigo_produto
      WHERE c.codigo_cliente = ?
      ORDER BY p.data_pedido DESC`,
      [codigoCliente],
    );

    // Group items by order
    const pedidos = pedidosRows.reduce((acc, row) => {
      const { pedido_codigo, valor, status, data_pedido, ...itemData } = row;

      let pedido = acc.find((p) => p.pedido_codigo === pedido_codigo);
      if (!pedido) {
        pedido = { pedido_codigo, valor, status, data_pedido, itens: [] };
        acc.push(pedido);
      }
      pedido.itens.push(itemData);
      return acc;
    }, []);

    return res.status(200).json({ success: true, pedidos });
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erro ao buscar pedidos." });
  }
});

pedidoRouter.get("/:id", async (req, res) => {
  try {
    // Busca o pedido
    const [pedidoRows] = await pool.query(
      `SELECT * FROM pedido WHERE codigo = ?`,
      [req.params.id],
    );

    if (pedidoRows.length === 0) {
      return res.status(404).json({
        message: "Registro não encontrado.",
      });
    }

    const pedido = pedidoRows[0];

    // Busca a conta do pedido
    const [contaRows] = await pool.query(
      `SELECT codigo_cliente FROM conta WHERE codigo = ?`,
      [pedido.codigo_conta],
    );

    if (contaRows.length > 0) {
      pedido.codigo_cliente = contaRows[0].codigo_cliente;
    } else {
      pedido.codigo_cliente = null;
    }

    return res.status(200).json(pedido);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar registro.",
      error: error.message,
    });
  }
});
