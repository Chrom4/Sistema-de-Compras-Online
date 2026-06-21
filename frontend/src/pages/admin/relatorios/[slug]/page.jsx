import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HomeHeader from "../../../../components/HomeHeader";

const API_BASE = "http://localhost:3001";

const titles = {
  "pedidos-conta": "Pedidos associados a uma conta",
  "produtos-carrinho": "Produtos em um carrinho",
  "dados-usuarios": "Quantidade e dados de usuários",
  "pagamento-popular": "Forma de pagamento mais utilizada",
  "filtro-localidade": "Filtro por bairro/cidade/UF",
  "media-vendas": "Média anual de vendas",
  "pico-vendas": "Mês/Ano com maior número de vendas",
  "usuarios-fieis": "Usuários fiéis",
  "produtos-sem-vendas": "Produtos sem Vendas",
  "ticket-medio-cliente": "Ranking de Clientes (Ticket Médio)",
};

// Helpers para deixar a tabela dinâmica bonita
const formatHeaderName = (key) => {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatCellValue = (key, value) => {
  if (value === null || value === undefined) return "—";

  const lowerKey = key.toLowerCase();

  // Formata colunas de dinheiro
  if (
    ["valor", "subtotal", "valor_total", "media_anual", "preco"].includes(
      lowerKey,
    )
  ) {
    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // Formata colunas de data
  if (lowerKey === "data_pedido") {
    return new Date(value).toLocaleDateString("pt-BR");
  }

  return String(value);
};

const AdminRelatorioPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({});

  const title = useMemo(
    () => titles[slug] || "Relatório Administrativo",
    [slug],
  );

  useEffect(() => {
    let isMounted = true;

    const loadReport = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE}/admin/relatorios/${slug}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Erro ao carregar relatório");
        }

        if (isMounted) {
          setRows(data?.relatorio ?? []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Erro ao carregar relatório");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadReport();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      Object.entries(filters).every(([key, value]) => {
        if (!value) return true;

        return String(row[key] ?? "")
          .toLowerCase()
          .includes(value.toLowerCase());
      }),
    );
  }, [rows, filters]);

  const filterOptions = useMemo(() => {
    if (!rows.length) return {};

    const options = {};

    Object.keys(rows[0]).forEach((key) => {
      options[key] = [...new Set(rows.map((row) => row[key]))]
        .filter((value) => value !== null && value !== undefined)
        .sort();
    });

    return options;
  }, [rows]);

  return (
    <div className="App">
      <HomeHeader hasBanner={false} />
      <div style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Cabeçalho da Página com Botão Voltar */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <button onClick={() => navigate(-1)} style={backButtonStyle}>
            &larr; Voltar
          </button>
          <div>
            <h2 style={{ margin: "0 0 0.5rem 0", color: "var(--text)" }}>
              {title}
            </h2>
          </div>
        </div>

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
              Carregando dados do relatório...
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

        {/* Tabela de Dados */}
        {!loading &&
          !error &&
          (rows.length ? (
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
                    {Object.keys(rows[0]).map((key) => (
                      <th key={key} style={thStyle}>
                        {formatHeaderName(key)}
                      </th>
                    ))}
                  </tr>

                  <tr>
                    {Object.keys(rows[0]).map((key) => (
                      <th key={`filter-${key}`} style={thStyle}>
                        <select
                          value={filters[key] || ""}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                          style={{
                            width: "100%",
                            padding: "6px",
                            borderRadius: "4px",
                            borderColor: "var(--border)",
                            background: "var(--secondary-bg)",
                          }}
                        >
                          <option value="">Todos</option>

                          {filterOptions[key]?.map((option) => (
                            <option key={option} value={option}>
                              {formatCellValue(key, option)}
                            </option>
                          ))}
                        </select>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, index) => (
                    <tr
                      key={`${row.codigo ?? index}-${index}`}
                      style={index % 2 === 0 ? trEvenStyle : trOddStyle}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--accent-bg)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          index % 2 === 0 ? "var(--secondary-bg)" : "var(--bg)")
                      }
                    >
                      {Object.keys(row).map((key) => (
                        <td key={`${key}-${index}`} style={tdStyle}>
                          {formatCellValue(key, row[key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      colSpan={Object.keys(rows[0]).length}
                      style={{
                        ...tdStyle,
                        textAlign: "right",
                        fontWeight: "bold",
                      }}
                    >
                      Registros encontrados: {filteredRows.length}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div style={statusCardStyle}>
              <p
                style={{
                  margin: 0,
                  fontSize: "16px",
                  color: "var(--text-muted)",
                }}
              >
                Nenhum dado encontrado para este relatório no momento.
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

const backButtonStyle = {
  background: "transparent",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  color: "var(--text)",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "bold",
  padding: "8px 16px",
  whiteSpace: "nowrap",
  marginTop: "4px",
};

const statusCardStyle = {
  padding: "2rem",
  textAlign: "center",
  background: "var(--secondary-bg)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  marginTop: "1rem",
};

const tableContainerStyle = {
  overflowX: "auto",
  background: "var(--secondary-bg)",
  borderRadius: "8px",
  border: "1px solid var(--border)",
  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
  marginTop: "1rem",
};

const thStyle = {
  padding: "12px 16px",
  fontWeight: "bold",
  textTransform: "uppercase",
  fontSize: "12px",
  letterSpacing: "0.5px",
  borderBottom: "2px solid var(--accent)",
};

const tdStyle = {
  padding: "12px 16px",
  verticalAlign: "top",
  borderBottom: "1px solid var(--border)",
  fontSize: "14px",
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

export default AdminRelatorioPage;
