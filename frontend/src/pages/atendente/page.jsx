import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPerfilCliente } from "../../helpers/page-helper";
import { useIsAuthenticated } from "../../hooks/useIsAuthenticated";
import HomeHeader from "../../components/HomeHeader";

const API_BASE = "http://localhost:3001";

const kpiGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "1rem",
  marginBottom: "2rem",
};
const kpiCardStyle = {
  padding: "1.5rem",
  background: "var(--secondary-bg)",
  borderRadius: "12px",
  border: "1px solid var(--border)",
  textAlign: "center",
};
const kpiTitle = {
  margin: "0 0 10px 0",
  color: "var(--text-muted)",
  fontSize: "12px",
  textTransform: "uppercase",
};
const kpiValue = { margin: 0, color: "var(--accent)" };

const actionGridStyle = {
  display: "grid",
  gridTemplateColumns: "350px 1fr",
  gap: "2rem",
};

const sectionTitle = {
  marginTop: 0,
  fontSize: "1.2rem",
  marginBottom: "1.5rem",
};

const primaryBtn = {
  padding: "12px",
  background: "var(--accent)",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
};
const secondaryBtn = {
  padding: "12px",
  background: "transparent",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  cursor: "pointer",
};

const AtendentePage = () => {
  const isAtendente =
    getPerfilCliente() === "atendente" || getPerfilCliente() === "admin";
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    pedidos: [],
    estoque: [],
    clientes: [],
  });
  const [loading, setLoading] = useState(true);

  if (!isAtendente || !isAuthenticated) {
    alert(
      "Página não disponível. Acesso restrito a atendentes e administradores.",
    );
    navigate("/");
    return null;
  }

  // Estilo base para os painéis reaproveitado
  const sectionCardStyle = {
    padding: "2rem",
    background: "var(--secondary-bg)",
    borderRadius: "12px",
    border: "1px solid var(--border)",
  };

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const [pedidosRes, estoqueRes, clientesRes] = await Promise.all([
          fetch(`${API_BASE}/atendente/pedidos`),
          fetch(`${API_BASE}/atendente/consultar/estoque`),
          fetch(`${API_BASE}/atendente/consultar/clientes?q=`),
        ]);

        const [pedidosData, estoqueData, clientesData] = await Promise.all([
          pedidosRes.json(),
          estoqueRes.json(),
          clientesRes.json(),
        ]);

        setSummary({
          pedidos: pedidosData?.pedidos ?? [],
          estoque: estoqueData?.produtos ?? [],
          clientes: clientesData?.clientes ?? [],
        });
      } catch (error) {
        console.error("Erro ao carregar resumo do atendente:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  const buttonStyle = {
    padding: "10px",
    background: "var(--accent)",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    textAlign: "left",
  };

  return (
    <div className="App">
      <HomeHeader hasBanner={false} />

      <div
        className="AppContent"
        style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}
      >
        <h1>Painel do Atendente</h1>
        <p>
          Resumo real das operações e acesso imediato às funções do atendimento.
        </p>

        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            marginTop: "1.5rem",
          }}
        >
          <div style={kpiGridStyle}>
            <div style={kpiCardStyle}>
              <h4 style={kpiTitle}>Pedidos Ativos</h4>
              <h2 style={kpiValue}>
                {loading ? "..." : summary.pedidos.length}
              </h2>
            </div>

            <div style={kpiCardStyle}>
              <h4 style={kpiTitle}>Produtos em Estoque</h4>
              <h2 style={kpiValue}>
                {loading ? "..." : summary.estoque.length}
              </h2>
            </div>

            <div style={kpiCardStyle}>
              <h4 style={kpiTitle}>Clientes Cadastrados</h4>
              <h2 style={kpiValue}>
                {loading ? "..." : summary.clientes.length}
              </h2>
            </div>
          </div>
        </div>

        <div style={actionGridStyle}>
          {/* PAINEL 1: Fluxo de Vendas */}
          <div style={sectionCardStyle}>
            <h2>Operações de Venda</h2>
            <p style={{ fontSize: "14px", marginBottom: "1rem" }}>
              Ações diretas para o atendimento ao cliente.
            </p>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <h3 style={{ fontSize: "16px", marginTop: "8px" }}>
                Novas Compras
              </h3>
              <button
                style={primaryBtn}
                onClick={() => navigate("/atendente/clientes/novo")}
              >
                Cadastrar Novo Cliente
              </button>
              <button
                style={secondaryBtn}
                onClick={() => navigate("/atendente/venda-telefone")}
              >
                Iniciar Venda por Telefone
              </button>
              <button
                style={secondaryBtn}
                onClick={() => navigate("/atendente/pagamentos")}
              >
                Registrar / Aprovar Pagamentos
              </button>

              <h3 style={{ fontSize: "16px", marginTop: "1rem" }}>
                Gestão de Pedidos
              </h3>
              <button
                style={primaryBtn}
                onClick={() => navigate("/atendente/pedidos")}
              >
                Visualizar Todos os Pedidos
              </button>
              <button
                style={secondaryBtn}
                onClick={() => navigate("/atendente/pedidos/status")}
              >
                Atualizar Status de Pedidos (Estoque)
              </button>
            </div>
          </div>

          {/* PAINEL 2: Consultas Operacionais */}
          <div style={{ ...sectionCardStyle, flex: 1 }}>
            <h2>Consultas Rápidas</h2>
            <p style={{ fontSize: "14px", marginBottom: "1rem" }}>
              Visualização de dados para suporte.
            </p>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <button
                style={{
                  ...buttonStyle,
                  background: "var(--accent, #0056b3)",
                }}
                onClick={() => navigate("/atendente/consultar/clientes")}
              >
                Buscar Cliente por CPF/Nome
              </button>
              <button
                style={{
                  ...buttonStyle,
                  background: "var(--accent, #0056b3)",
                }}
                onClick={() => navigate("/atendente/consultar/estoque")}
              >
                Consultar Catálogo e Estoque
              </button>
              <button
                style={{
                  ...buttonStyle,
                  background: "var(--accent, #0056b3)",
                }}
                onClick={() => navigate("/atendente/consultar/carrinhos")}
              >
                Visualizar Carrinhos Ativos
              </button>
            </div>
          </div>

          <section style={sectionCardStyle}>
            <h2 style={sectionTitle}>Últimos Pedidos</h2>

            {loading ? (
              <p>Carregando...</p>
            ) : (
              <ul>
                {summary.pedidos.slice(0, 5).map((pedido) => (
                  <li key={pedido.codigo}>
                    #{pedido.codigo} - {pedido.status}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AtendentePage;
