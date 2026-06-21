import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeHeader from "../../../../components/HomeHeader";

const NovoUsuarioPage = () => {
  const [form, setForm] = useState({
    login: "",
    senha: "",
    perfil: "cliente",
    status: "novo",
    codigo_cliente: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:3001/usuarios/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          codigo_cliente: Number(form.codigo_cliente || 0),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao criar usuário");
      }

      setMessage("Usuário criado com sucesso! Redirecionando...");

      // Dá um tempo para o usuário ler a mensagem de sucesso antes de sair da tela
      setTimeout(() => {
        navigate("/admin/usuarios");
      }, 1500);
    } catch (err) {
      setMessage(err.message || "Erro ao criar usuário");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <HomeHeader hasBanner={false} />
      <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
        {/* Cabeçalho da Página */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={backButtonStyle}
          >
            &larr; Voltar
          </button>
          <div>
            <h2 style={{ margin: "0 0 4px 0", color: "var(--text)" }}>
              Cadastrar Novo Usuário
            </h2>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>
              Preencha os dados abaixo para conceder acesso ao sistema.
            </p>
          </div>
        </div>

        {/* Formulário */}
        <div style={cardStyle}>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.25rem",
              }}
            >
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Login *</label>
                <input
                  name="login"
                  placeholder="Nome de usuário ou email"
                  required
                  value={form.login}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Senha *</label>
                <input
                  name="senha"
                  type="password"
                  placeholder="Defina uma senha"
                  required
                  value={form.senha}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Código do Cliente Vinculado</label>
              <input
                name="codigo_cliente"
                type="number"
                placeholder="Ex: 42 (Deixe em branco se for Admin)"
                value={form.codigo_cliente}
                onChange={handleChange}
                style={inputStyle}
              />
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  marginTop: "4px",
                }}
              >
                Opcional. Vincule a conta a um cliente existente no banco de
                dados.
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.25rem",
              }}
            >
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Perfil de Acesso *</label>
                <select
                  name="perfil"
                  value={form.perfil}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="cliente">Cliente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Status Inicial *</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="novo">Novo</option>
                  <option value="ativo">Ativo</option>
                  <option value="bloqueado">Bloqueado</option>
                  <option value="banido temporariamente">
                    Banido Temporariamente
                  </option>
                </select>
              </div>
            </div>

            {/* Ações e Feedback */}
            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "1.25rem",
                marginTop: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ flex: 1 }}>
                {message && (
                  <p
                    style={{
                      margin: 0,
                      fontWeight: "bold",
                      color: message.includes("sucesso")
                        ? "var(--success, #0a5)"
                        : "var(--danger, #b42318)",
                    }}
                  >
                    {message}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  style={cancelButtonStyle}
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={submitButtonStyle}
                  disabled={isLoading}
                >
                  {isLoading ? "Salvando..." : "Salvar Usuário"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const cardStyle = {
  background: "var(--secondary-bg, #ffffff)",
  padding: "2rem",
  borderRadius: "12px",
  border: "1px solid var(--border, #e5e7eb)",
  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
};

const inputGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const labelStyle = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "var(--text, #333)",
};

const inputStyle = {
  padding: "12px",
  borderRadius: "6px",
  border: "1px solid var(--border, #ccc)",
  fontSize: "15px",
  background: "var(--bg, #fff)",
  color: "var(--text, #111)",
  outline: "none",
};

const backButtonStyle = {
  background: "transparent",
  border: "1px solid var(--border, #ccc)",
  borderRadius: "6px",
  color: "var(--text, #333)",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "bold",
  padding: "8px 16px",
};

const submitButtonStyle = {
  padding: "12px 24px",
  borderRadius: "6px",
  border: "none",
  background: "var(--accent, #0d6efd)",
  color: "white",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
  transition: "opacity 0.2s",
};

const cancelButtonStyle = {
  padding: "12px 24px",
  borderRadius: "6px",
  border: "1px solid var(--border, #ccc)",
  background: "transparent",
  color: "var(--text-muted, #666)",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
};

export default NovoUsuarioPage;
