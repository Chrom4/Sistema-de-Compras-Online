import { useState } from "react";
import HomeHeader from "../../../../components/HomeHeader";

const API_BASE = "http://localhost:3001";

const NovoClienteAtendentePage = () => {
  const [form, setForm] = useState({ nome: "", cpf: "", telefone: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "cpf") {
      value = value.replace(/\D/g, "").slice(0, 11);
    }

    if (name === "telefone") {
      value = value.replace(/\D/g, "");
      value = value.slice(0, 11);

      if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d)/, "($1) $2");
      }

      if (value.length > 13) {
        value = value.replace(/(\d{5})(\d{4})$/, "$1-$2");
      } else if (value.length > 9) {
        value = value.replace(/(\d{4})(\d)/, "$1-$2");
      }
    }

    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.nome.trim()) newErrors.nome = "O nome é obrigatório.";

    if (form.cpf.length !== 11) {
      newErrors.cpf = "O CPF deve ter exatamente 11 dígitos.";
    }

    if (form.telefone.length < 10) {
      newErrors.telefone = "Insira um telefone válido com DDD.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setMessage("Enviando...");

    try {
      const response = await fetch(`${API_BASE}/atendente/clientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data?.message || "Cliente cadastrado com sucesso.");
        setForm({ nome: "", cpf: "", telefone: "" }); // Limpa o formulário após sucesso
      } else {
        setMessage(data?.message || "Falha ao cadastrar cliente.");
      }
    } catch (error) {
      setMessage("Erro de conexão com o backend.");
      console.error(error);
    }
  };

  return (
    <div className="App">
      <HomeHeader hasBanner={false} />
      <div style={{ padding: "1.5rem", maxWidth: "700px", margin: "0 auto" }}>
        <h2>Cadastrar Cliente</h2>
        <p>Cadastro rápido para vendas por telefone.</p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <input
              type="text"
              name="nome"
              placeholder="Nome"
              value={form.nome}
              onChange={handleChange}
              style={inputStyle}
            />
            {errors.nome && (
              <span style={{ color: "red", fontSize: "14px" }}>
                {errors.nome}
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <input
              type="text"
              name="cpf"
              placeholder="CPF (Somente números)"
              value={form.cpf}
              onChange={handleChange}
              style={inputStyle}
            />
            {errors.cpf && (
              <span style={{ color: "red", fontSize: "14px" }}>
                {errors.cpf}
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <input
              type="text"
              name="telefone"
              placeholder="Telefone: (12) 12345-6789"
              value={form.telefone}
              onChange={handleChange}
              style={inputStyle}
            />
            {errors.telefone && (
              <span style={{ color: "red", fontSize: "14px" }}>
                {errors.telefone}
              </span>
            )}
          </div>

          <button type="submit" style={buttonStyle}>
            Salvar cliente
          </button>

          {message && (
            <p
              style={{
                color:
                  message.includes("Erro") || message.includes("Falha")
                    ? "red"
                    : "#0a5",
                margin: 0,
                fontWeight: "bold",
              }}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

const inputStyle = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid var(--border, #ccc)",
};

const buttonStyle = {
  padding: "10px 14px",
  borderRadius: "6px",
  border: "none",
  background: "var(--accent, #0d6efd)",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
  marginTop: "8px",
};

export default NovoClienteAtendentePage;
