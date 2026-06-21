import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeHeader from "../../../components/HomeHeader";
import { formatPrice } from "../../../helpers/data-helpers";

const API_BASE = "http://localhost:3001";

const VendaTelefonePage = () => {
  const [cpf, setCpf] = useState("");
  const [cliente, setCliente] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [produtoBusca, setProdutoBusca] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 1. Busca Cliente
  const handleBuscarCliente = async () => {
    try {
      const res = await fetch(`${API_BASE}/clientes/`);
      const data = await res.json();
      const lista = Array.isArray(data) ? data : (data?.clientes ?? []);
      const encontrado = lista.find((c) => c.cpf === cpf);
      if (encontrado) {
        setCliente(encontrado);
        setMessage("Cliente localizado.");
      } else {
        setMessage("Cliente não encontrado.");
      }
    } catch (e) {
      setMessage("Erro ao buscar cliente.");
    }
  };

  // 2. Adicionar ao estado local
  const handleAdicionarProduto = async () => {
    try {
      const res = await fetch(`${API_BASE}/produtos/`);
      const data = await res.json();
      const produtos = Array.isArray(data) ? data : (data?.produtos ?? []);
      const prod = produtos.find(
        (p) =>
          String(p.codigo) === produtoBusca ||
          p.nome.toLowerCase().includes(produtoBusca.toLowerCase()),
      );

      if (prod) {
        setCartItems((prev) => [
          ...prev,
          { ...prod, item_codigo: prod.codigo, quantidade: 1 },
        ]);
        setProdutoBusca("");
      } else {
        setMessage("Produto não encontrado.");
      }
    } catch (e) {
      setMessage("Erro ao buscar produto.");
    }
  };

  // 3. Loop sequencial para adicionar ao BD e finalizar
  const handleProcessarVenda = async () => {
    if (!cliente || cartItems.length === 0) return;
    setIsLoading(true);
    setMessage("Processando itens...");

    try {
      // Loop sequencial respeitando a ordem e espera do servidor
      for (const item of cartItems) {
        const response = await fetch(`${API_BASE}/carrinhos/adicionar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")?.replaceAll('"', "")}`,
          },
          body: JSON.stringify({
            codigoCliente: cliente.codigo,
            codigoProduto: item.codigo,
            quantidade: item.quantidade,
          }),
        });
        if (!response.ok) throw new Error(`Erro ao adicionar ${item.nome}`);
      }

      // Finaliza o pedido
      const res = await fetch(`${API_BASE}/pedidos/finalizar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigoCliente: cliente.codigo,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Pedido criado com sucesso!");
      } else {
        throw new Error(data.message || "Erro ao finalizar pedido");
      }
    } catch (e) {
      setMessage(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <HomeHeader hasBanner={false} />
      <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
        <h2>Venda por Telefone</h2>

        {!cliente ? (
          <div style={{ display: "flex", gap: "10px", marginBottom: "2rem" }}>
            <input
              placeholder="CPF do Cliente"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              style={inputStyle}
            />
            <button onClick={handleBuscarCliente} style={buttonStyle}>
              Buscar Cliente
            </button>
          </div>
        ) : (
          <div
            style={{
              marginBottom: "2rem",
              padding: "1rem",
              background: "var(--secondary-bg)",
              borderRadius: "8px",
              border: "1px solid var(--border)",
            }}
          >
            <h3>
              Cliente: {cliente.nome}{" "}
              <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                (CPF: {cliente.cpf})
              </span>
            </h3>
            <button
              onClick={() => setCliente(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--danger)",
                cursor: "pointer",
              }}
            >
              Trocar cliente
            </button>
          </div>
        )}

        {cliente && (
          <>
            <div style={{ display: "flex", gap: "10px", marginBottom: "2rem" }}>
              <input
                placeholder="Código ou nome do produto"
                value={produtoBusca}
                onChange={(e) => setProdutoBusca(e.target.value)}
                style={inputStyle}
              />
              <button onClick={handleAdicionarProduto} style={buttonStyle}>
                Adicionar
              </button>
            </div>

            {cartItems.length > 0 && (
              <div style={tableContainerStyle}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "var(--bg)", color: "white" }}>
                    <tr>
                      <th style={thStyle}>Qtd</th>
                      <th style={thStyle}>Produto</th>
                      <th style={thStyle}>Preço</th>
                      <th style={thStyle}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item, i) => (
                      <tr
                        key={i}
                        style={{ borderBottom: "1px solid var(--border)" }}
                      >
                        <td style={tdStyle}>
                          <input
                            type="number"
                            min="1"
                            value={item.quantidade}
                            onChange={(e) =>
                              setCartItems((prev) =>
                                prev.map((it, idx) =>
                                  idx === i
                                    ? {
                                        ...it,
                                        quantidade: Number(e.target.value),
                                      }
                                    : it,
                                ),
                              )
                            }
                            style={qtyInputStyle}
                          />
                        </td>
                        <td style={tdStyle}>{item.nome}</td>
                        <td style={tdStyle}>{formatPrice(item.preco)}</td>
                        <td style={tdStyle}>
                          <button
                            onClick={() =>
                              setCartItems(
                                cartItems.filter((_, idx) => idx !== i),
                              )
                            }
                            style={deleteBtnStyle}
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  onClick={handleProcessarVenda}
                  disabled={isLoading}
                  style={{ ...buttonStyle, marginTop: "1rem", width: "100%" }}
                >
                  {isLoading ? "Processando..." : "Finalizar Pedido"}
                </button>
              </div>
            )}
          </>
        )}
        <p style={{ marginTop: "1rem", fontWeight: "bold" }}>{message}</p>
      </div>
    </div>
  );
};

const inputStyle = {
  padding: "12px",
  borderRadius: "6px",
  border: "1px solid var(--border)",
  flex: 1,
};
const qtyInputStyle = {
  width: "60px",
  padding: "6px",
  borderRadius: "4px",
  border: "1px solid var(--border)",
};
const buttonStyle = {
  padding: "12px 20px",
  background: "var(--accent)",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
};
const deleteBtnStyle = {
  background: "var(--danger-bg)",
  color: "var(--danger)",
  border: "none",
  padding: "6px 10px",
  borderRadius: "4px",
  cursor: "pointer",
};
const tableContainerStyle = {
  background: "var(--secondary-bg)",
  borderRadius: "8px",
  border: "1px solid var(--border)",
  overflow: "hidden",
};
const thStyle = { padding: "12px", textAlign: "left" };
const tdStyle = { padding: "12px" };

export default VendaTelefonePage;
