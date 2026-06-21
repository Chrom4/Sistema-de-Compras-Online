import { createCrudRouter } from "./_crudFactory.js";
import { pool } from "../config/database.js";
import bcrypt from "bcrypt";

export const usuarioRouter = createCrudRouter({
  tableName: "usuario",
  methodsToExclude: ["put", "post"],
});

usuarioRouter.patch("/:id/banir", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "UPDATE usuario SET status = ? WHERE codigo = ?",
      ["banido temporariamente", id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Usuário banido/inativado com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao banir usuário:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao banir usuário.",
      error: error.message,
    });
  }
});

usuarioRouter.put("/:id", async (req, res) => {
  try {
    const body = { ...(req.body ?? {}) };

    if (Object.keys(body).length === 0) {
      return res.status(400).json({
        message: "O corpo da requisição está vazio.",
      });
    }

    // Se veio senha, criptografa antes de salvar
    if (body.senha) {
      body.senha = await bcrypt.hash(body.senha, 10);
    }

    const columns = Object.keys(body);

    const assignments = columns.map((column) => `\`${column}\` = ?`).join(", ");

    const values = [...Object.values(body), req.params.id];

    const sql = `
      UPDATE usuario
      SET ${assignments}
      WHERE codigo = ?
    `;

    const [result] = await pool.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Registro não encontrado.",
      });
    }

    return res.status(200).json({
      message: "Registro atualizado com sucesso.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao atualizar registro.",
      error: error.message,
    });
  }
});

usuarioRouter.post("/", async (req, res) => {
  try {
    const body = { ...(req.body ?? {}) };
    const columns = Object.keys(body);

    if (columns.length === 0) {
      return res
        .status(400)
        .json({ message: "O corpo da requisição está vazio." });
    }

    if (body.senha) {
      body.senha = await bcrypt.hash(body.senha, 10);
    }

    const values = Object.values(body);
    const placeholders = columns.map(() => "?").join(", ");

    const sql = `INSERT INTO \`usuario\` (\`${columns.join("`, `")}\`) VALUES (${placeholders})`;

    const [result] = await pool.query(sql, values);

    return res.status(201).json({
      id: result.insertId,
      message: "Registro criado com sucesso.",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erro ao criar registro.", error: error.message });
  }
});
