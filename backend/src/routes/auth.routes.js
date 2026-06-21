import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { pool } from "../config/database.js"; // Importe a conexão direta com o banco

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  try {
    const { login, senha } = req.body ?? {};

    if (!login || !senha) {
      return res
        .status(400)
        .json({ success: false, message: "Login e senha são obrigatórios." });
    }

    // 1. Busca o usuário diretamente no banco
    const [users] = await pool.query("SELECT * FROM usuario WHERE login = ?", [
      login,
    ]);
    const user = users[0];

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Usuário não encontrado." });
    }

    // 2. Compara a senha usando bcrypt.compare!
    const isPasswordValid = await bcrypt.compare(senha, user.senha);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Senha incorreta." });
    }

    // 3. Verifica se o usuário não está banido/bloqueado
    if (
      user.status === "banido temporariamente" ||
      user.status === "bloqueado"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Usuário bloqueado ou banido." });
    }

    // 4. Gera o token (é útil colocar o perfil no token para o frontend saber se é admin ou cliente)
    const token = jwt.sign(
      {
        login: user.login,
        perfil: user.perfil,
        codigo_cliente: user.codigo_cliente,
        perfil: user.perfil,
      },
      env.jwtSecret,
      { expiresIn: env.jwtExpiration || "1d" }, // Garanta que tenha um fallback
    );

    return res
      .status(200)
      .json({ success: true, message: "Login bem-sucedido.", token });
  } catch (error) {
    console.error("Erro no login:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor." });
  }
});

authRouter.post("/register", async (req, res) => {
  // 1. Capturamos o perfil, definindo "cliente" como padrão caso não seja enviado
  const {
    login,
    senha,
    nome,
    cpf,
    telefone,
    perfil = "cliente",
  } = req.body ?? {};

  // Validação básica
  if (!login || !senha || !nome || !cpf || !telefone) {
    return res.status(400).json({
      success: false,
      message: "Dados incompletos. Informe login, senha, nome, cpf e telefone.",
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 2. Verifica se login já existe (válido para TODOS os perfis)
    const [existingUser] = await connection.query(
      "SELECT login FROM usuario WHERE login = ?",
      [login],
    );
    if (existingUser.length > 0) {
      throw new Error("Usuário já existe.");
    }

    // 3. Faz o hash da senha
    const encryptedPassword = await bcrypt.hash(senha, 10);

    let clienteId = null;

    // 4. Lógica exclusiva para o perfil CLIENTE
    if (perfil === "cliente") {
      // Verifica se CPF já existe na tabela cliente
      const [existingCpf] = await connection.query(
        "SELECT cpf FROM cliente WHERE cpf = ?",
        [cpf],
      );
      if (existingCpf.length > 0) {
        throw new Error("CPF já cadastrado.");
      }

      // Cria o Cliente
      const [clienteResult] = await connection.query(
        "INSERT INTO cliente (cpf, telefone, nome) VALUES (?, ?, ?)",
        [cpf, telefone, nome],
      );
      clienteId = clienteResult.insertId;
    }

    // 5. Cria o Usuário (Para admin/atendente, clienteId será null)
    await connection.query(
      "INSERT INTO usuario (codigo_cliente, login, senha, perfil, status) VALUES (?, ?, ?, ?, ?)",
      [clienteId, login, encryptedPassword, perfil, "novo"],
    );

    // 6. Continuação da lógica exclusiva para CLIENTE (Conta e Carrinho)
    if (perfil === "cliente") {
      // Cria a Conta
      const [contaResult] = await connection.query(
        "INSERT INTO conta (codigo_cliente, origem) VALUES (?, ?)",
        [clienteId, "web"],
      );

      // Cria o carrinho da conta
      await connection.query("INSERT INTO carrinho (codigo_conta) VALUES (?)", [
        contaResult.insertId,
      ]);
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: `${perfil.charAt(0).toUpperCase() + perfil.slice(1)} registrado com sucesso.`,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Erro no registro:", error);
    return res.status(400).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
});
