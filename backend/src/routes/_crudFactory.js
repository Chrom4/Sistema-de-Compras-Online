import { Router } from "express";
import { pool } from "../config/database.js";

export const createCrudRouter = ({
  tableName,
  idColumn = "codigo",
  methodsToExclude = [],
}) => {
  const router = Router();

  // Lista todos os registros
  if (!methodsToExclude.includes("get")) {
    router.get("/", async (_req, res) => {
      try {
        const [rows] = await pool.query(`SELECT * FROM \`${tableName}\``);
        res.status(200).json(rows);
      } catch (error) {
        res
          .status(500)
          .json({ message: "Erro ao listar registros.", error: error.message });
      }
    });

    // Busca um registro específico
    router.get("/:id", async (req, res) => {
      try {
        const [rows] = await pool.query(
          `SELECT * FROM \`${tableName}\` WHERE \`${idColumn}\` = ?`,
          [req.params.id],
        );

        if (rows.length === 0) {
          return res.status(404).json({ message: "Registro não encontrado." });
        }

        return res.status(200).json(rows[0]);
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Erro ao buscar registro.", error: error.message });
      }
    });
  }

  // Cria um novo registro
  if (!methodsToExclude.includes("post")) {
    router.post("/", async (req, res) => {
      try {
        const body = req.body ?? {};
        const columns = Object.keys(body);

        if (columns.length === 0) {
          return res
            .status(400)
            .json({ message: "O corpo da requisição está vazio." });
        }

        const values = Object.values(body);
        const placeholders = columns.map(() => "?").join(", ");
        const sql = `INSERT INTO \`${tableName}\` (\`${columns.join("`, `")}\`) VALUES (${placeholders})`;
        const [result] = await pool.query(sql, values);

        return res
          .status(201)
          .json({
            id: result.insertId,
            message: "Registro criado com sucesso.",
          });
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Erro ao criar registro.", error: error.message });
      }
    });
  }

  // Atualiza um registro existente
  if (!methodsToExclude.includes("put")) {
    router.put("/:id", async (req, res) => {
      try {
        const body = req.body ?? {};
        const columns = Object.keys(body);

        if (columns.length === 0) {
          return res
            .status(400)
            .json({ message: "O corpo da requisição está vazio." });
        }

        const assignments = columns
          .map((column) => `\`${column}\` = ?`)
          .join(", ");
        const values = [...Object.values(body), req.params.id];
        const sql = `UPDATE \`${tableName}\` SET ${assignments} WHERE \`${idColumn}\` = ?`;

        const [result] = await pool.query(sql, values);

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Registro não encontrado." });
        }

        return res
          .status(200)
          .json({ message: "Registro atualizado com sucesso." });
      } catch (error) {
        return res.status(500).json({
          message: "Erro ao atualizar registro.",
          error: error.message,
        });
      }
    });
  }

  // Remove um registro existente
  router.delete("/:id", async (req, res) => {
    try {
      const [result] = await pool.query(
        `DELETE FROM \`${tableName}\` WHERE \`${idColumn}\` = ?`,
        [req.params.id],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Registro não encontrado." });
      }

      return res
        .status(200)
        .json({ message: "Registro removido com sucesso." });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Erro ao remover registro.", error: error.message });
    }
  });

  return router;
};
