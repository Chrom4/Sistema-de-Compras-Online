import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCodigoCliente } from "../../helpers/page-helper";
import { formatPrice } from "../../helpers/data-helpers";
import HomeHeader from "../../components/HomeHeader";

const PedidosPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const codigoCliente = getCodigoCliente();

  useEffect(() => {
    if (!codigoCliente) {
      navigate("/login");
      return;
    }

    const fetchPedidos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `http://localhost:3001/pedidos/cliente/${codigoCliente}`,
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar pedidos.");
        }

        const data = await response.json();
        const pedidos = data.pedidos.reverse()
        setPedidos(pedidos || []);
      } catch (err) {
        console.error("Erro na requisição:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPedidos();
  }, [codigoCliente, navigate]);

  return (
    <div className="App">
      <HomeHeader />
      <div style={{ padding: "1rem", maxWidth: "900px", margin: "0 auto" }}>
        <h1>Meus Pedidos</h1>

        {isLoading ? (
          <p>Carregando seus pedidos...</p>
        ) : error ? (
          <p style={{ color: "red" }}>Ocorreu um erro: {error}</p>
        ) : pedidos.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              marginTop: "1rem",
            }}
          >
            {pedidos.map((pedido) => (
              <div
                key={pedido.pedido_codigo}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "1rem",
                  background: "var(--secondary-bg)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #eee",
                    paddingBottom: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <strong>Pedido #{pedido.pedido_codigo}</strong>
                  <span>
                    Data:{" "}
                    {new Date(pedido.data_pedido).toLocaleDateString("pt-BR")}
                  </span>
                  <span
                    style={{
                      fontWeight: "bold",
                      color:
                        pedido.status === "cancelado"
                          ? "red"
                          : pedido.status === "pago"
                            ? "green"
                            : "var(--accent)",
                    }}
                  >
                    Status: {pedido.status.toUpperCase()}
                  </span>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "4px" }}>
                        Produto
                      </th>
                      <th style={{ textAlign: "center", padding: "4px" }}>
                        Qtd
                      </th>
                      <th style={{ textAlign: "right", padding: "4px" }}>
                        Preço
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedido.itens.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: "4px" }}>{item.produto_nome}</td>
                        <td style={{ textAlign: "center", padding: "4px" }}>
                          {item.quantidade}
                        </td>
                        <td style={{ textAlign: "right", padding: "4px" }}>
                          {formatPrice(item.produto_preco)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Substitua a div do Total e do Botão por esta: */}
                <div
                  style={{
                    display: "flex",
                    alignSelf: "flex-end",
                    marginRight: "auto",
                    textAlign: "right",
                    marginTop: "1rem",
                    fontWeight: "bold",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  Total: {formatPrice(pedido.valor)}
                  {pedido.status === "confirmado" && (
                    <button
                      onClick={() =>
                        navigate("/pagamento", {
                          state: {
                            pedidoId: pedido.pedido_codigo,
                            valorTotal: pedido.valor,
                          },
                        })
                      }
                      style={{
                        padding: "8px 16px",
                        background: "var(--accent, #007bff)",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Pagar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Você ainda não realizou nenhum pedido.</p>
        )}
      </div>
    </div>
  );
};

export default PedidosPage;
