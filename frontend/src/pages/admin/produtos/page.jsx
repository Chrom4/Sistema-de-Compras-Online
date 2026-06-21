import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeHeader from "../../../components/HomeHeader";

const ProdutosPage = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3001/produtos/");
      if (!response.ok) throw new Error("Erro ao buscar produtos");
      const data = await response.json();
      setProdutos(data);
    } catch (err) {
      setError(err.message || "Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  const handleDelete = async (codigo) => {
    if (!window.confirm("Deseja realmente remover este produto do catálogo?"))
      return;

    // Atualização otimista: remove o item da tela imediatamente
    setProdutos((prev) => prev.filter((p) => p.codigo !== codigo));
    setMessage("");

    try {
      const response = await fetch(`http://localhost:3001/produtos/${codigo}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Erro ao remover produto");
      }
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Erro ao comunicar com o servidor.");
      // Se falhar, reverte buscando os dados originais do banco
      fetchProdutos();
    }
  };

  // Helper para formatar o preço
  const formatPrice = (price) => {
    return Number(price).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="App">
      <HomeHeader hasBanner={false} />
      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Cabeçalho da Página */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h2 style={{ margin: "0 0 0.5rem 0", color: "var(--text)" }}>
              Gerenciar Produtos
            </h2>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>
              Cadastre, edite e exclua produtos do catálogo do sistema.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/produtos/novo")}
            style={newButtonStyle}
          >
            + Novo Produto
          </button>
        </div>

        {/* Feedback de Mensagens (Erros na exclusão, etc) */}
        {message && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "1rem",
              background: "var(--danger-bg, #fef3f2)",
              color: "var(--danger, #b42318)",
              borderRadius: "8px",
              fontWeight: "bold",
            }}
          >
            {message}
          </div>
        )}

        {/* Estados de Carregamento e Erro */}
        {loading && (
          <div style={statusCardStyle}>
            <p
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: "bold",
                color: "var(--text-muted)",
              }}
            >
              Carregando lista de produtos...
            </p>
          </div>
        )}

        {error && (
          <div
            style={{
              ...statusCardStyle,
              borderColor: "var(--danger-border)",
              background: "var(--danger-bg)",
              color: "var(--danger)",
            }}
          >
            <p style={{ margin: 0, fontWeight: "bold" }}>{error}</p>
          </div>
        )}

        {/* Tabela de Produtos */}
        {!loading && !error && (
          <div style={tableContainerStyle}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead style={{ background: "var(--bg)", color: "white" }}>
                <tr>
                  <th
                    style={{ ...thStyle, width: "80px", textAlign: "center" }}
                  >
                    Código
                  </th>
                  <th style={thStyle}>Nome do Produto</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Estoque</th>
                  <th style={thStyle}>Preço Un.</th>
                  <th
                    style={{ ...thStyle, textAlign: "center", width: "180px" }}
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {produtos.length > 0 ? (
                  produtos.map((produto, index) => {
                    return (
                      <tr
                        key={produto.codigo}
                        style={index % 2 === 0 ? trEvenStyle : trOddStyle}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "var(--accent-bg)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            index % 2 === 0
                              ? "var(--secondary-bg)"
                              : "var(--bg)")
                        }
                      >
                        <td
                          style={{
                            ...tdStyle,
                            textAlign: "center",
                            fontWeight: "bold",
                            color: "var(--text-muted)",
                          }}
                        >
                          #{produto.codigo}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            fontWeight: "bold",
                            color: "var(--text)",
                          }}
                        >
                          {produto.nome}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <span
                            style={{
                              background: "var(--accent-bg)",
                              padding: "6px 12px",
                              borderRadius: "20px",
                              fontSize: "13px",
                              fontWeight: "bold",
                            }}
                          >
                            {produto.quantidade_estoque}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: "var(--text-muted)" }}>
                          {formatPrice(produto.preco)}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              justifyContent: "center",
                            }}
                          >
                            <button
                              onClick={() =>
                                navigate(`/admin/produtos/${produto.codigo}`)
                              }
                              style={editBtnStyle}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(produto.codigo)}
                              style={deleteBtnStyle}
                              title="Remover Produto"
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        padding: "2rem",
                        textAlign: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      Nenhum produto cadastrado no catálogo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const newButtonStyle = {
  padding: "12px 20px",
  borderRadius: "8px",
  border: "none",
  background: "var(--accent)",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "15px",
  boxShadow: "0 4px 6px rgba(13, 110, 253, 0.2)",
};

const statusCardStyle = {
  padding: "2rem",
  textAlign: "center",
  background: "var(--secondary-bg)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
};

const tableContainerStyle = {
  overflowX: "auto",
  background: "var(--secondary-bg)",
  borderRadius: "12px",
  border: "1px solid var(--border)",
  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
};

const thStyle = {
  padding: "16px",
  fontWeight: "bold",
  textTransform: "uppercase",
  fontSize: "13px",
  letterSpacing: "0.5px",
  borderBottom: "2px solid var(--accent)",
};

const tdStyle = {
  padding: "16px",
  verticalAlign: "middle",
  borderBottom: "1px solid var(--border)",
  fontSize: "15px",
  color: "var(--text)",
};

const trEvenStyle = {
  backgroundColor: "var(--secondary-bg)",
  transition: "background-color 0.2s",
};
const trOddStyle = {
  backgroundColor: "var(--bg)",
  transition: "background-color 0.2s",
};

const actionBtnBase = {
  padding: "6px 12px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "13px",
  transition: "all 0.2s",
};

const editBtnStyle = {
  ...actionBtnBase,
  background: "var(--accent)",
  color: "white",
  border: "1px solid var(--accent-bg)",
};

const deleteBtnStyle = {
  ...actionBtnBase,
  background: "var(--bg)",
  color: "var(--text)",
  border: "1px solid var(--accent-bg)",
};

export default ProdutosPage;
