import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeHeader from "../../../components/HomeHeader";

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3001/usuarios/");
      if (!response.ok) throw new Error("Erro ao buscar usuários");
      const data = await response.json();
      setUsuarios(data);
    } catch (err) {
      setError(err.message || "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleDelete = async (codigo) => {
    if (!window.confirm("Deseja realmente banir/inativar este usuário?"))
      return;

    // Atualização otimista: altera o status na tela antes mesmo da requisição terminar
    setUsuarios((prev) =>
      prev.map((user) =>
        user.codigo === codigo ? { ...user, status: "bloqueado" } : user,
      ),
    );

    try {
      const response = await fetch(
        `http://localhost:3001/usuarios/${codigo}/banir`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Erro ao banir usuário");
      }

      // Se sucesso, puxa a lista novamente do banco para garantir consistência
      await fetchUsuarios();
    } catch (err) {
      console.error(err);
      alert(err.message || "Erro ao comunicar com o servidor.");
      // Se falhar, reverte buscando os dados originais
      fetchUsuarios();
    }
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
              Gerenciar Usuários
            </h2>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>
              Controle de acesso, perfis e inativação de contas do sistema.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/usuarios/novo")}
            style={newButtonStyle}
          >
            + Novo Usuário
          </button>
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
              Carregando lista de usuários...
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

        {/* Tabela de Usuários */}
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
                  <th style={thStyle}>Login</th>
                  <th style={thStyle}>Perfil</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Cód. Cliente</th>
                  <th
                    style={{ ...thStyle, textAlign: "center", width: "180px" }}
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length > 0 ? (
                  usuarios.map((usuario, index) => {
                    return (
                      <tr
                        key={usuario.codigo}
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
                          #{usuario.codigo}
                        </td>
                        <td style={{ ...tdStyle, fontWeight: "bold" }}>
                          {usuario.login}
                        </td>
                        <td style={{ ...tdStyle, textTransform: "capitalize" }}>
                          {usuario.perfil}
                        </td>
                        <td style={tdStyle}>
                          <span
                            style={{
                              background: "var(--accent-bg)",
                              padding: "4px 8px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "bold",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {usuario.status}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: "var(--text-muted)" }}>
                          {usuario.codigo_cliente
                            ? `#${usuario.codigo_cliente}`
                            : "—"}
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
                                navigate(`/admin/usuarios/${usuario.codigo}`)
                              }
                              style={editBtnStyle}
                            >
                              Editar
                            </button>
                            {/* Opcional: Desabilita o botão de banir se ele já for Admin ou já estiver bloqueado */}
                            <button
                              onClick={() => handleDelete(usuario.codigo)}
                              style={{
                                ...deleteBtnStyle,
                                opacity: usuario.perfil === "admin" ? 0.5 : 1,
                                cursor:
                                  usuario.perfil === "admin"
                                    ? "not-allowed"
                                    : "pointer",
                              }}
                              disabled={usuario.perfil === "admin"}
                              title={
                                usuario.perfil === "admin"
                                  ? "Admins não podem ser banidos por aqui"
                                  : "Banir Usuário"
                              }
                            >
                              Banir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        padding: "2rem",
                        textAlign: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      Nenhum usuário cadastrado encontrado.
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
  background: "var(--accent, #0d6efd)",
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

export default UsuariosPage;
