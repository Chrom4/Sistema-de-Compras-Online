import { Router } from "express";
import { pool } from "../config/database.js";

export const atendenteRouter = Router();

atendenteRouter.post("/enderecos", async (req, res) => {
  // 1. Alterado aqui no destructuring
  const {
    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    pais,
    codigo_cliente = null,
  } = req.body ?? {};

  if (
    !cep ||
    !logradouro ||
    !numero ||
    !bairro ||
    !cidade ||
    !estado ||
    !pais
  ) {
    return res.status(400).json({
      success: false,
      message: "Preencha todos os campos obrigatórios.",
    });
  }

  try {
    const [result] = await pool.query(
      // 2. Alterado aqui no nome da coluna
      `INSERT INTO endereco (codigo_cliente, cep, logradouro, numero, complemento, bairro, cidade, estado, pais) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      // 3. Alterado aqui no array de valores
      [
        codigo_cliente,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        pais,
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Endereço cadastrado com sucesso.",
      enderecoId: result.insertId,
    });
  } catch (error) {
    console.error("Erro ao cadastrar endereço:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao salvar endereço.",
      error: error.message,
    });
  }
});

atendenteRouter.post("/clientes", async (req, res) => {
  const { nome, cpf, telefone } = req.body ?? {};

  if (!nome || !cpf || !telefone) {
    return res.status(400).json({
      success: false,
      message: "Nome, CPF e telefone são obrigatórios.",
    });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      "SELECT codigo FROM cliente WHERE cpf = ?",
      [cpf],
    );
    if (existing.length) {
      return res
        .status(409)
        .json({ success: false, message: "CPF já cadastrado." });
    }

    const [clienteResult] = await connection.query(
      "INSERT INTO cliente (cpf, telefone, nome) VALUES (?, ?, ?)",
      [cpf, telefone, nome],
    );

    const codigoCliente = clienteResult.insertId;

    const [contaResult] = await connection.query(
      "INSERT INTO conta (codigo_cliente, origem) VALUES (?, ?)",
      [codigoCliente, "telefone"],
    );

    await connection.query("INSERT INTO carrinho (codigo_conta) VALUES (?)", [
      contaResult.insertId,
    ]);

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Cliente cadastrado com sucesso.",
      codigoCliente,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Erro ao cadastrar cliente:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao cadastrar cliente.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

atendenteRouter.get("/pedidos", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.codigo, p.codigo_conta, p.valor, p.status, p.data_pedido,
             c.codigo_cliente
      FROM pedido p
      LEFT JOIN conta c ON c.codigo = p.codigo_conta
      ORDER BY p.data_pedido DESC, p.codigo DESC
    `);

    return res.status(200).json({ success: true, pedidos: rows });
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao listar pedidos.",
      error: error.message,
    });
  }
});

atendenteRouter.patch("/pedidos/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body ?? {};

  // 1. Definição da Máquina de Estados (Níveis de evolução do pedido)
  const statusLevels = {
    "em processamento": 1,
    confirmado: 2,
    pago: 3,
    enviado: 4,
    "em trânsito": 5,
    entregue: 6,
    finalizado: 7,
  };

  // 2. Validação básica de entrada
  const validStatuses = [...Object.keys(statusLevels), "cancelado"];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message:
        "Status inválido. Valores permitidos: " + validStatuses.join(", "),
    });
  }

  const connection = await pool.getConnection();

  try {
    const [currentOrder] = await connection.query(
      "SELECT status FROM pedido WHERE codigo = ?",
      [id],
    );

    if (currentOrder.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Pedido não encontrado." });
    }

    const currentStatus = currentOrder[0].status;

    // 3. Regras de Bloqueio e Transição
    if (currentStatus === "cancelado" || currentStatus === "finalizado") {
      return res.status(403).json({
        success: false,
        message: `Operação negada. O pedido já está '${currentStatus}'.`,
      });
    }

    if (status === "cancelado") {
      if (currentStatus === "entregue") {
        return res.status(403).json({
          success: false,
          message: "Não é possível cancelar um pedido que já foi 'entregue'.",
        });
      }
    } else {
      if (statusLevels[status] <= statusLevels[currentStatus]) {
        return res.status(403).json({
          success: false,
          message: `Transição inválida: Não é possível retroceder ou manter o pedido de '${currentStatus}' para '${status}'.`,
        });
      }
    }

    const [result] = await connection.query(
      "UPDATE pedido SET status = ? WHERE codigo = ?",
      [status, id],
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "Falha ao atualizar o pedido no banco.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Status atualizado para '${status}' com sucesso.`,
    });
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao atualizar status do pedido.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

atendenteRouter.get("/consultar/clientes", async (req, res) => {
  const busca = (req.query.q || "").trim();

  try {
    if (!busca) {
      const [rows] = await pool.query(
        "SELECT codigo, nome, cpf, telefone FROM cliente ORDER BY codigo DESC LIMIT 20",
      );
      return res.status(200).json({ success: true, clientes: rows });
    }

    const [rows] = await pool.query(
      "SELECT codigo, nome, cpf, telefone FROM cliente WHERE nome LIKE ? OR cpf LIKE ? ORDER BY codigo DESC LIMIT 20",
      [`%${busca}%`, `%${busca}%`],
    );

    return res.status(200).json({ success: true, clientes: rows });
  } catch (error) {
    console.error("Erro ao consultar clientes:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao consultar clientes.",
      error: error.message,
    });
  }
});

atendenteRouter.get("/consultar/estoque", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT codigo, nome, quantidade_estoque, preco FROM produto ORDER BY codigo",
    );
    return res.status(200).json({ success: true, produtos: rows });
  } catch (error) {
    console.error("Erro ao consultar estoque:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao consultar estoque.",
      error: error.message,
    });
  }
});

atendenteRouter.get("/consultar/carrinhos", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.codigo AS codigo_carrinho,
             ct.codigo AS codigo_conta,
             ct.codigo_cliente,
             COUNT(ic.codigo) AS qtd_itens
      FROM carrinho c
      LEFT JOIN conta ct ON ct.codigo = c.codigo_conta
      LEFT JOIN item_carrinho ic ON ic.codigo_carrinho = c.codigo
      GROUP BY c.codigo, ct.codigo, ct.codigo_cliente
      ORDER BY c.codigo DESC
    `);
    return res.status(200).json({ success: true, carrinhos: rows });
  } catch (error) {
    console.error("Erro ao consultar carrinhos:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao consultar carrinhos.",
      error: error.message,
    });
  }
});

atendenteRouter.get("/relatorios/pedidos-conta", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.codigo, p.valor, p.status, p.data_pedido,
             c.codigo AS codigo_conta, c.codigo_cliente
      FROM pedido p
      JOIN conta c ON c.codigo = p.codigo_conta
      ORDER BY p.data_pedido DESC, p.codigo DESC
    `);
    return res.status(200).json({ success: true, relatorio: rows });
  } catch (error) {
    console.error("Erro no relatório pedidos-conta:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao gerar relatório.",
      error: error.message,
    });
  }
});

atendenteRouter.get("/relatorios/produtos-carrinho", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.codigo AS codigo_carrinho,
             p.codigo AS codigo_produto,
             p.nome AS produto,
             ic.quantidade,
             (ic.quantidade * p.preco) AS subtotal
      FROM carrinho c
      JOIN item_carrinho ic ON ic.codigo_carrinho = c.codigo
      JOIN produto p ON p.codigo = ic.codigo_produto
      ORDER BY c.codigo, p.codigo
    `);
    return res.status(200).json({ success: true, relatorio: rows });
  } catch (error) {
    console.error("Erro no relatório produtos-carrinho:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao gerar relatório.",
      error: error.message,
    });
  }
});

atendenteRouter.get("/relatorios/dados-usuarios", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.perfil, u.status, COUNT(*) AS quantidade,
             GROUP_CONCAT(DISTINCT u.login ORDER BY u.login SEPARATOR ', ') AS logins
      FROM usuario u
      GROUP BY u.perfil, u.status
      ORDER BY u.perfil, u.status
    `);
    return res.status(200).json({ success: true, relatorio: rows });
  } catch (error) {
    console.error("Erro no relatório dados-usuarios:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao gerar relatório.",
      error: error.message,
    });
  }
});

atendenteRouter.get("/relatorios/pagamento-popular", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT forma_pagamento, COUNT(*) AS total_registros, SUM(valor) AS valor_total
      FROM pagamento
      GROUP BY forma_pagamento
      ORDER BY total_registros DESC, valor_total DESC
      LIMIT 5
    `);
    return res.status(200).json({ success: true, relatorio: rows });
  } catch (error) {
    console.error("Erro no relatório pagamento-popular:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao gerar relatório.",
      error: error.message,
    });
  }
});

atendenteRouter.get("/relatorios/filtro-localidade", async (req, res) => {
  const { bairro = "", cidade = "", estado = "" } = req.query ?? {};

  try {
    const conditions = [];
    const values = [];

    if (bairro) {
      conditions.push("e.bairro LIKE ?");
      values.push(`%${bairro}%`);
    }
    if (cidade) {
      conditions.push("e.cidade LIKE ?");
      values.push(`%${cidade}%`);
    }
    if (estado) {
      conditions.push("e.estado LIKE ?");
      values.push(`%${estado}%`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const [rows] = await pool.query(
      `
      SELECT c.codigo AS codigo_cliente,
             c.nome,
             c.cpf,
             e.bairro,
             e.cidade,
             e.estado,
             e.pais
      FROM cliente c
      LEFT JOIN endereco e ON e.codigo_cliente = c.codigo 
      ${whereClause}
      ORDER BY c.codigo DESC
    `,
      values,
    );

    return res.status(200).json({ success: true, relatorio: rows });
  } catch (error) {
    console.error("Erro no relatório filtro-localidade:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao gerar relatório.",
      error: error.message,
    });
  }
});

atendenteRouter.get("/relatorios/media-vendas", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT YEAR(data_pedido) AS ano, ROUND(AVG(valor), 2) AS media_anual
      FROM pedido
      WHERE status IN ('pago', 'enviado', 'em trânsito', 'entregue', 'finalizado')
      GROUP BY YEAR(data_pedido)
      ORDER BY ano
    `);
    return res.status(200).json({ success: true, relatorio: rows });
  } catch (error) {
    console.error("Erro no relatório media-vendas:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao gerar relatório.",
      error: error.message,
    });
  }
});

atendenteRouter.get("/relatorios/pico-vendas", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT YEAR(data_pedido) AS ano,
             MONTH(data_pedido) AS mes,
             COUNT(*) AS total_pedidos
      FROM pedido
      WHERE status IN ('pago', 'enviado', 'em trânsito', 'entregue', 'finalizado')
      GROUP BY YEAR(data_pedido), MONTH(data_pedido)
      ORDER BY total_pedidos DESC, ano DESC, mes DESC
      LIMIT 1
    `);
    return res.status(200).json({ success: true, relatorio: rows });
  } catch (error) {
    console.error("Erro no relatório pico-vendas:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao gerar relatório.",
      error: error.message,
    });
  }
});

atendenteRouter.get("/relatorios/usuarios-fieis", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.codigo AS codigo_cliente,
             c.nome,
             COUNT(DISTINCT DATE_FORMAT(p.data_pedido, '%Y-%m')) AS meses_com_compra
      FROM cliente c
      JOIN conta ct ON ct.codigo_cliente = c.codigo
      JOIN pedido p ON p.codigo_conta = ct.codigo
      GROUP BY c.codigo, c.nome
      HAVING COUNT(DISTINCT DATE_FORMAT(p.data_pedido, '%Y-%m')) >= 12
      ORDER BY meses_com_compra DESC
    `);
    return res.status(200).json({ success: true, relatorio: rows });
  } catch (error) {
    console.error("Erro no relatório usuarios-fieis:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao gerar relatório.",
      error: error.message,
    });
  }
});

// ROTA ADICIONAL 1: Produtos que nunca foram vendidos
atendenteRouter.get("/relatorios/produtos-sem-vendas", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.codigo, p.nome, p.preco, p.quantidade_estoque
      FROM produto p
      LEFT JOIN item_pedido ip ON p.codigo = ip.codigo_produto
      WHERE ip.codigo IS NULL
      ORDER BY p.codigo DESC
    `);
    return res.status(200).json({ success: true, relatorio: rows });
  } catch (error) {
    console.error("Erro no relatório produtos-sem-vendas:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao gerar relatório de produtos sem vendas.",
      error: error.message,
    });
  }
});

// ROTA ADICIONAL 2: Ranking de clientes por volume de gastos
atendenteRouter.get("/relatorios/ticket-medio-cliente", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.nome, c.cpf, SUM(p.valor) AS total_gasto
      FROM cliente c
      JOIN conta ct ON ct.codigo_cliente = c.codigo
      JOIN pedido p ON p.codigo_conta = ct.codigo
      WHERE p.status IN ('pago', 'enviado', 'em trânsito', 'entregue', 'finalizado')
      GROUP BY c.codigo, c.nome, c.cpf
      ORDER BY total_gasto DESC
      LIMIT 10
    `);
    return res.status(200).json({ success: true, relatorio: rows });
  } catch (error) {
    console.error("Erro no relatório ticket-medio-cliente:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao gerar relatório de ticket médio por cliente.",
      error: error.message,
    });
  }
});

atendenteRouter.get("/enderecos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query("SELECT * FROM endereco WHERE codigo = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Endereço não encontrado." });
    }

    return res.status(200).json({ success: true, endereco: rows[0] });
  } catch (error) {
    console.error("Erro ao buscar endereço:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erro ao buscar endereço." });
  }
});

atendenteRouter.put("/enderecos/:id", async (req, res) => {
  const { id } = req.params;
  const { cep, logradouro, numero, complemento, bairro, cidade, estado, pais } =
    req.body ?? {};

  if (
    !cep ||
    !logradouro ||
    !numero ||
    !bairro ||
    !cidade ||
    !estado ||
    !pais
  ) {
    return res.status(400).json({
      success: false,
      message: "Preencha todos os campos obrigatórios.",
    });
  }

  try {
    const [result] = await pool.query(
      `UPDATE endereco 
       SET cep = ?, logradouro = ?, numero = ?, complemento = ?, bairro = ?, cidade = ?, estado = ?, pais = ? 
       WHERE codigo = ?`,
      [cep, logradouro, numero, complemento, bairro, cidade, estado, pais, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Endereço não encontrado ou nenhuma alteração enviada.",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Endereço atualizado com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar endereço:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erro ao atualizar endereço." });
  }
});

atendenteRouter.post("/pagamentos", async (req, res) => {
  const { codigoPedido, pagamentos = [], codigoEndereco } = req.body ?? {};

  if (!codigoPedido || !pagamentos.length) {
    return res.status(400).json({
      success: false,
      message: "codigoPedido e lista de pagamentos são obrigatórios.",
    });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [pedidoRows] = await connection.query(
      "SELECT codigo FROM pedido WHERE codigo = ?",
      [codigoPedido],
    );
    if (!pedidoRows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Pedido não encontrado." });
    }

    for (const pag of pagamentos) {
      await connection.query(
        "INSERT INTO pagamento (codigo_pedido, forma_pagamento, parcelas, valor) VALUES (?, ?, ?, ?)",
        [codigoPedido, pag.forma, pag.parcelas || 1, pag.valor],
      );
    }

    if (codigoEndereco) {
      await connection.query(
        "UPDATE pedido SET status = ?, codigo_endereco = ? WHERE codigo = ?",
        ["pago", codigoEndereco, codigoPedido],
      );
    } else {
      await connection.query("UPDATE pedido SET status = ? WHERE codigo = ?", [
        "pago",
        codigoPedido,
      ]);
    }

    await connection.commit();

    return res
      .status(201)
      .json({ success: true, message: "Pagamentos registrados com sucesso." });
  } catch (error) {
    await connection.rollback();
    console.error("Erro ao registrar pagamentos:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao registrar pagamentos.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
});
