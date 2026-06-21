import { createCrudRouter } from "./_crudFactory.js";
import { pool } from "../config/database.js"; // <-- Não esqueça deste import!

export const enderecoRouter = createCrudRouter({ tableName: "endereco" });

enderecoRouter.get("/cliente/:id", async (req, res) => {
  const codigoCliente = req.params.id;

  try {
    // Busca todos os endereços vinculados a esse cliente, do mais recente para o mais antigo
    const [enderecosRows] = await pool.query(
      `SELECT 
        codigo, 
        cep, 
        logradouro, 
        numero, 
        complemento, 
        bairro, 
        cidade, 
        estado, 
        pais 
      FROM endereco 
      WHERE codigo_cliente = ?
      ORDER BY codigo DESC`,
      [codigoCliente]
    );

    // Retorna a lista (pode ser vazia, o que é um estado válido se ele não tiver cadastrado nenhum)
    return res.status(200).json({
      success: true,
      enderecos: enderecosRows,
    });
  } catch (error) {
    console.error("Erro ao buscar endereços do cliente:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao buscar os endereços.",
      error: error.message,
    });
  }
});