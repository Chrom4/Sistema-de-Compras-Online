import { useState, useEffect } from "react";
import HomeHeader from "../../components/HomeHeader";
import { useLocation, useNavigate } from "react-router-dom";
import { getCodigoCliente } from "../../helpers/page-helper";

const API_BASE = "http://localhost:3001";

const EnderecosPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const codigoCliente = location.state?.clienteId || getCodigoCliente();

  const [enderecosSalvos, setEnderecosSalvos] = useState([]);
  const [isLoadingEnderecos, setIsLoadingEnderecos] = useState(true);
  const [addNew, setAddNew] = useState(false);

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
  const [isLoading, setIsLoading] = useState(false);

  // Busca os endereços já cadastrados quando a página carrega
  useEffect(() => {
    if (!codigoCliente) {
      navigate("/login");
      return;
    }
    
    const fetchEnderecos = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/enderecos/cliente/${codigoCliente}`,
        );
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setEnderecosSalvos(data.enderecos || []);
        }
      } catch (error) {
        console.error("Erro ao buscar endereços salvos:", error);
      } finally {
        setIsLoadingEnderecos(false);
      }
    };

    fetchEnderecos();
  }, []);

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

  // Função para usar um endereço existente
  const handleSelectSavedAddress = (id) => {
    if (location.state?.returnTo) {
      navigate(location.state.returnTo, {
        state: {
          pedidoId: location.state.pedidoId,
          valorTotal: location.state.valorTotal,
          enderecoId: id, // Retorna o ID do endereço clicado!
        },
      });
    } else {
      setMessage("Endereço selecionado (nenhum pedido em andamento).");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("Salvando endereço...");

    try {
      const response = await fetch(`${API_BASE}/atendente/enderecos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // A CORREÇÃO ESTÁ AQUI: Mesclando o form com o codigo_cliente!
        body: JSON.stringify({
          ...form,
          codigo_cliente: codigoCliente,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Endereço salvo com sucesso! Redirecionando...");

        if (location.state?.returnTo) {
          setTimeout(() => {
            navigate(location.state.returnTo, {
              state: {
                pedidoId: location.state.pedidoId,
                valorTotal: location.state.valorTotal,
                enderecoId: data.enderecoId,
              },
            });
          }, 1200);
        } else {
          setForm({
            cep: "",
            logradouro: "",
            numero: "",
            complemento: "",
            bairro: "",
            cidade: "",
            estado: "",
            pais: "Brasil",
          });
          // Recarrega a lista para mostrar o novo endereço que acabou de ser criado
          setAddNew(false);
          window.location.reload();
        }
      } else {
        setMessage(data?.message || "Erro ao salvar endereço.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      setMessage("Erro de conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setAddNew(false);
    if (location.state?.returnTo) {
      navigate(location.state.returnTo, {
        state: {
          pedidoId: location.state.pedidoId,
          valorTotal: location.state.valorTotal,
        },
      });
    }
  };

  return (
    <div className="App">
      <HomeHeader />
      <div style={{ padding: "1.5rem", maxWidth: "700px", margin: "0 auto" }}>
        {/* SESSÃO 1: ENDEREÇOS SALVOS */}
        <div>
          <h2>Endereços Cadastrados</h2>
          <p style={{ fontSize: "14px", color: "#666" }}>
            Selecione um endereço existente ou cadastre um novo abaixo.
          </p>

          {isLoadingEnderecos ? (
            <p>Carregando endereços...</p>
          ) : enderecosSalvos.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                maxHeight: "250px",
                overflowY: "auto",
                paddingRight: "5px",
              }}
            >
              {enderecosSalvos.map((end) => (
                <div key={end.codigo} style={cardStyle}>
                  <div>
                    <strong style={{ display: "block" }}>
                      {end.logradouro}, {end.numero}{" "}
                      {end.complemento && `- ${end.complemento}`}
                    </strong>
                    <span style={{ fontSize: "13px", color: "#555" }}>
                      {end.bairro}, {end.cidade} - {end.estado} | CEP: {end.cep}
                    </span>
                  </div>

                  {location.state?.returnTo ? (
                    <button
                      type="button"
                      onClick={() => handleSelectSavedAddress(end.codigo)}
                      style={useButtonStyle}
                    >
                      Usar este
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate(`/endereco/${end.codigo}`)}
                      style={useButtonStyle}
                    >
                      Editar
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "14px", fontStyle: "italic" }}>
              Nenhum endereço encontrado no sistema.
            </p>
          )}
        </div>

        <hr
          style={{
            margin: "2rem 0",
            borderTop: "1px solid var(--border, #eee)",
          }}
        />

        {/* SESSÃO 2: NOVO ENDEREÇO */}
        {addNew ? (
          <>
            <h1>Cadastrar Novo Endereço</h1>

            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginTop: "1rem",
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
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <label style={{ fontSize: "14px", fontWeight: "bold" }}>
                    CEP *
                  </label>
                  <input
                    name="cep"
                    placeholder="00000-000"
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
                    Logradouro (Rua, Av, etc.) *
                  </label>
                  <input
                    name="logradouro"
                    placeholder="Ex: Rua das Flores"
                    value={form.logradouro}
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
                  }}
                >
                  <label style={{ fontSize: "14px", fontWeight: "bold" }}>
                    Número *
                  </label>
                  <input
                    name="numero"
                    placeholder="Ex: 123"
                    type="number"
                    value={form.numero}
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
                  }}
                >
                  <label style={{ fontSize: "14px", fontWeight: "bold" }}>
                    Complemento
                  </label>
                  <input
                    name="complemento"
                    placeholder="Apto, Bloco (Opcional)"
                    value={form.complemento}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <label style={{ fontSize: "14px", fontWeight: "bold" }}>
                    Bairro *
                  </label>
                  <input
                    name="bairro"
                    placeholder="Bairro"
                    value={form.bairro}
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
                  }}
                >
                  <label style={{ fontSize: "14px", fontWeight: "bold" }}>
                    Cidade *
                  </label>
                  <input
                    name="cidade"
                    placeholder="Cidade"
                    value={form.cidade}
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
                  }}
                >
                  <label style={{ fontSize: "14px", fontWeight: "bold" }}>
                    Estado (UF) *
                  </label>
                  <input
                    name="estado"
                    placeholder="Ex: RJ"
                    value={form.estado}
                    onChange={handleChange}
                    style={inputStyle}
                    maxLength="2"
                    required
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <label style={{ fontSize: "14px", fontWeight: "bold" }}>
                    País *
                  </label>
                  <input
                    name="pais"
                    placeholder="País"
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
                  onClick={handleCancel}
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
                  {isLoading ? "Salvando..." : "Salvar Endereço"}
                </button>
              </div>

              {message && (
                <p
                  style={{
                    color: message.includes("Erro") ? "red" : "#0a5",
                    margin: 0,
                    fontWeight: "bold",
                  }}
                >
                  {message}
                </p>
              )}
            </form>
          </>
        ) : (
          <button onClick={() => setAddNew(true)} style={useButtonStyle}>
            + Adicionar
          </button>
        )}
      </div>
    </div>
  );
};

// Estilos
const cardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px",
  border: "1px solid var(--border, #ccc)",
  borderRadius: "8px",
  background: "var(--secondary-bg, #f9f9f9)",
};

const useButtonStyle = {
  padding: "8px 12px",
  borderRadius: "6px",
  border: "none",
  background: "var(--accent, #0d6efd)",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "13px",
  whiteSpace: "nowrap",
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

export default EnderecosPage;
