import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HomeHeader from "../../../components/HomeHeader"; // Ajuste o caminho conforme sua estrutura

const API_BASE = "http://localhost:3001";

const EnderecoEditPage = () => {
  const { id } = useParams(); // Captura o ID da URL
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    pais: "Brasil",
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Busca os dados do endereço específico assim que a página carrega
  useEffect(() => {
    const fetchEndereco = async () => {
      try {
        const response = await fetch(`${API_BASE}/atendente/enderecos/${id}`);
        const data = await response.json();

        if (response.ok && data.endereco) {
          // Preenche o formulário evitando valores null do banco
          setForm({
            cep: data.endereco.cep || "",
            logradouro: data.endereco.logradouro || "",
            numero: data.endereco.numero || "",
            complemento: data.endereco.complemento || "",
            bairro: data.endereco.bairro || "",
            cidade: data.endereco.cidade || "",
            estado: data.endereco.estado || "",
            pais: data.endereco.pais || "Brasil",
          });
        } else {
          setMessage("Endereço não encontrado.");
        }
      } catch (error) {
        console.error("Erro ao carregar endereço:", error);
        setMessage("Erro de conexão com o servidor.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEndereco();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja excluir este endereço?")) {
      return;
    }

    setIsSaving(true);
    setMessage("Excluindo endereço...");

    try {
      const response = await fetch(`${API_BASE}/enderecos/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Endereço excluído com sucesso!");
        setTimeout(() => {
          navigate("/enderecos"); // Volta para a lista principal
        }, 1500);
      } else {
        setMessage(data?.message || "Erro ao excluir endereço.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      setMessage("Erro de conexão com o servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "cep") {
      value = value.replace(/\D/g, "").slice(0, 8);
      if (value.length > 5) {
        value = value.replace(/^(\d{5})(\d)/, "$1-$2");
      }
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("Atualizando endereço...");

    try {
      const response = await fetch(`${API_BASE}/atendente/enderecos/${id}`, {
        method: "PUT", // Usamos PUT para indicar atualização
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Endereço atualizado com sucesso!");
        setTimeout(() => {
          navigate("/enderecos"); // Volta para a lista principal
        }, 1500);
      } else {
        setMessage(data?.message || "Erro ao atualizar endereço.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      setMessage("Erro de conexão com o servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="App">
        <HomeHeader hasBanner={false} />
        <div style={{ padding: "2rem", textAlign: "center" }}>
          Carregando dados do endereço...
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <HomeHeader hasBanner={false} />
      <div style={{ padding: "1.5rem", maxWidth: "700px", margin: "0 auto" }}>
        <h1>Editar Endereço #{id}</h1>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginTop: "1.5rem",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label style={{ fontSize: "14px", fontWeight: "bold" }}>
                CEP *
              </label>
              <input
                name="cep"
                value={form.cep}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                gridColumn: "span 2",
              }}
            >
              <label style={{ fontSize: "14px", fontWeight: "bold" }}>
                Logradouro *
              </label>
              <input
                name="logradouro"
                value={form.logradouro}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label style={{ fontSize: "14px", fontWeight: "bold" }}>
                Número *
              </label>
              <input
                name="numero"
                type="number"
                value={form.numero}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label style={{ fontSize: "14px", fontWeight: "bold" }}>
                Complemento
              </label>
              <input
                name="complemento"
                value={form.complemento}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label style={{ fontSize: "14px", fontWeight: "bold" }}>
                Bairro *
              </label>
              <input
                name="bairro"
                value={form.bairro}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label style={{ fontSize: "14px", fontWeight: "bold" }}>
                Cidade *
              </label>
              <input
                name="cidade"
                value={form.cidade}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label style={{ fontSize: "14px", fontWeight: "bold" }}>
                Estado (UF) *
              </label>
              <input
                name="estado"
                value={form.estado}
                onChange={handleChange}
                style={inputStyle}
                maxLength="2"
                required
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label style={{ fontSize: "14px", fontWeight: "bold" }}>
                País *
              </label>
              <input
                name="pais"
                value={form.pais}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={cancelButtonStyle}
              disabled={isSaving}
              >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              style={deleteButtonStyle}
              disabled={isSaving}
            >
              Deletar
            </button>
            <button type="submit" style={submitButtonStyle} disabled={isSaving}>
              {isSaving ? "Atualizando..." : "Salvar Alterações"}
            </button>
          </div>

          {message && (
            <p
              style={{
                color:
                  message.includes("Erro") || message.includes("não encontrado")
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
  fontSize: "14px",
};
const submitButtonStyle = {
  flex: 2,
  padding: "12px",
  borderRadius: "6px",
  border: "none",
  background: "var(--accent, #0d6efd)",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px",
};
const cancelButtonStyle = {
  flex: 1,
  padding: "12px",
  borderRadius: "6px",
  border: "1px solid var(--border, #ccc)",
  background: "transparent",
  color: "var(--text, #333)",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px",
};
const deleteButtonStyle = {
  flex: 1,
  padding: "12px",
  borderRadius: "6px",
  border: "none",
  background: "rgb(153, 9, 9)",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px",
};

export default EnderecoEditPage;
