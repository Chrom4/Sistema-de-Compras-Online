import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeHeader from "../../../../components/HomeHeader";

const NovoProdutoPage = () => {
  const [form, setForm] = useState({
    nome: "",
    quantidade_estoque: "",
    preco: "",
    descricao: "",
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
      const response = await fetch("http://localhost:3001/produtos/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          quantidade_estoque: Number(form.quantidade_estoque || 0),
          preco: Number(form.preco || 0),
          descricao: form.descricao,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao criar produto");
      }

      setMessage("Produto adicionado com sucesso! Redirecionando...");

      // Dá um tempo para o usuário ler a mensagem antes de sair da tela
      setTimeout(() => {
        navigate("/admin/produtos");
      }, 1500);
    } catch (err) {
      setMessage(err.message || "Erro ao criar produto");
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
              Cadastrar Novo Produto
            </h2>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>
              Preencha os detalhes para adicionar um novo item ao catálogo.
            </p>
          </div>
        </div>

        {/* Formulário */}
        <div style={cardStyle}>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Nome do Produto *</label>
              <input
                name="nome"
                placeholder="Ex: Teclado Mecânico RGB"
                required
                value={form.nome}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.25rem",
              }}
            >
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Preço (R$) *</label>
                <input
                  name="preco"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required
                  value={form.preco}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Quantidade em Estoque *</label>
                <input
                  name="quantidade_estoque"
                  type="number"
                  min="0"
                  placeholder="Ex: 50"
                  required
                  value={form.quantidade_estoque}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Descrição</label>
              <textarea
                name="descricao"
                placeholder="Detalhes técnicos, características e diferenciais do produto..."
                value={form.descricao}
                onChange={handleChange}
                style={{
                  ...inputStyle,
                  minHeight: "100px",
                  resize: "vertical",
                }}
              />
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
                  {isLoading ? "Salvando..." : "Salvar Produto"}
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

export default NovoProdutoPage;
