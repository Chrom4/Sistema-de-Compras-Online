import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPerfilCliente } from "../../helpers/page-helper";
import { useIsAuthenticated } from "../../hooks/useIsAuthenticated";
import HomeHeader from "../../components/HomeHeader";

const API_BASE = "http://localhost:3001";

const AdminPage = () => {
  const isAdmin = getPerfilCliente() === "admin";
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    usuarios: [],
    pagamentos: [],
    mediaVendas: [],
    picoVendas: [],
  });
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    if (!isAdmin || !isAuthenticated) {
      navigate("/");
      return null;
    }
    const loadSummary = async () => {
      try {
        const [usuariosRes, pagamentosRes, mediaRes, picoRes] =
          await Promise.all([
            fetch(`${API_BASE}/admin/relatorios/dados-usuarios`),
            fetch(`${API_BASE}/admin/relatorios/pagamento-popular`),
            fetch(`${API_BASE}/admin/relatorios/media-vendas`),
            fetch(`${API_BASE}/admin/relatorios/pico-vendas`),
          ]);
        const [u, p, m, pi] = await Promise.all([
          usuariosRes.json(),
          pagamentosRes.json(),
          mediaRes.json(),
          picoRes.json(),
        ]);
        setSummary({
          usuarios: u.relatorio,
          pagamentos: p.relatorio,
          mediaVendas: m.relatorio,
          picoVendas: pi.relatorio,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, []);

  console.log(summary);
  return (
    <div className="App">
      <HomeHeader hasBanner={false} />

      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>Painel Administrativo</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
          Gerenciamento de recursos e indicadores de BI.
        </p>

        {/* 1. KPIs (Resumo de métricas) */}
        <div style={kpiGridStyle}>
          <div style={kpiCardStyle}>
            <h4 style={kpiTitle}>Total de Usuários</h4>
            {loading ? (
              "..."
            ) : (
              <h2 style={kpiValue}>
                {summary.usuarios.reduce(
                  (acc, curr) => acc + curr.quantidade,
                  0,
                )}
              </h2>
            )}
          </div>
          <div style={kpiCardStyle}>
            <h4 style={kpiTitle}>Forma Pagto. Favorita</h4>
            {loading ? (
              "..."
            ) : (
              <h3 style={kpiValue}>
                {summary.pagamentos
                  .filter(
                    ({ total_registros }) =>
                      total_registros === summary.pagamentos[0].total_registros,
                  )
                  .map(({ forma_pagamento }) => forma_pagamento)
                  .join(", ") || "-"}
              </h3>
            )}
          </div>
          <div style={kpiCardStyle}>
            <h4 style={kpiTitle}>Média Vendas (Ano Atual)</h4>
            {loading ? (
              "..."
            ) : (
              <h3 style={kpiValue}>
                R${" "}
                {Number(
                  summary.mediaVendas.slice(-1)[0]?.media_anual || 0,
                ).toFixed(2)}
              </h3>
            )}
          </div>
          <div style={kpiCardStyle}>
            <h4 style={kpiTitle}>Pico de Vendas</h4>
            {loading ? (
              "..."
            ) : (
              <h3 style={kpiValue}>
                {summary.picoVendas[0]
                  ? `${summary.picoVendas[0].mes}/${summary.picoVendas[0].ano}`
                  : "-"}
              </h3>
            )}
          </div>
        </div>

        {/* 2. Seções de Ação (Grid de 2 colunas) */}
        <div style={actionGridStyle}>
          <section style={sectionCardStyle}>
            <h2 style={sectionTitle}>Manutenção</h2>
            <div style={btnGroupStyle}>
              <button
                style={primaryBtn}
                onClick={() => navigate("/admin/usuarios/novo")}
              >
                + Novo Usuário
              </button>
              <button
                style={secondaryBtn}
                onClick={() => navigate("/admin/usuarios")}
              >
                Gerenciar Usuários
              </button>
              <div style={{ marginTop: "1rem" }} />
              <button
                style={primaryBtn}
                onClick={() => navigate("/admin/produtos/novo")}
              >
                + Novo Produto
              </button>
              <button
                style={secondaryBtn}
                onClick={() => navigate("/admin/produtos")}
              >
                Gerenciar Produtos
              </button>
            </div>
          </section>

          <section style={sectionCardStyle}>
            <h2 style={sectionTitle}>Relatórios Consolidados</h2>
            <div style={reportGridStyle}>
              {[
                "pedidos-conta",
                "produtos-carrinho",
                "dados-usuarios",
                "pagamento-popular",
                "filtro-localidade",
                "media-vendas",
                "pico-vendas",
                "usuarios-fieis",
                "produtos-sem-vendas",
                "ticket-medio-cliente",
              ].map((slug) => (
                <button
                  key={slug}
                  style={reportBtn}
                  onClick={() => navigate(`/admin/relatorios/${slug}`)}
                >
                  {slug.replace(/-/g, " ")}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const kpiGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
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
const sectionCardStyle = {
  padding: "2rem",
  background: "var(--secondary-bg)",
  borderRadius: "12px",
  border: "1px solid var(--border)",
};
const sectionTitle = {
  marginTop: 0,
  fontSize: "1.2rem",
  marginBottom: "1.5rem",
};

const btnGroupStyle = { display: "flex", flexDirection: "column", gap: "10px" };
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

const reportGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "10px",
};
const reportBtn = {
  padding: "10px",
  background: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  cursor: "pointer",
  textAlign: "left",
  fontSize: "14px",
};

export default AdminPage;
