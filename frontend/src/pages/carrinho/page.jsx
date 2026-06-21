import { useEffect, useState, useActionState, startTransition } from "react";
import HomeHeader from "../../components/HomeHeader";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { getCodigoCliente } from "../../helpers/page-helper";
import { formatPrice } from "../../helpers/data-helpers";

const CarrinhoPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const codigoCliente = getCodigoCliente();

  const [state, removeFromCart, isPending] = useActionState(
    async (prevState, codigo) => {
      try {
        const response = await fetch(
          `http://localhost:3001/itens-carrinho/${codigo}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")?.replaceAll('"', "")}`,
            },
          },
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          return {
            success: false,
            error: errData.message || "Erro ao remover item.",
          };
        }

        return { success: true, message: "Produto removido do carrinho!" };
      } catch (error) {
        console.error("Erro no removeFromCart:", error);
        return { success: false, error: "Erro de conexão com o servidor." };
      }
    },
    null,
  );

  useEffect(() => {
    if (!codigoCliente) {
      navigate("/login");
      return;
    }

    const fetchCart = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `http://localhost:3001/carrinhos/cliente/${codigoCliente}`,
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar carrinho: " + response.statusText);
        }

        const result = await response.json();
        const items = result.items || [];

        setCartItems(items);
        setSelectedItems(items.map((item) => item.item_codigo));
      } catch (err) {
        console.error("Erro na requisição:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [codigoCliente, navigate]);

  const cartTotal = cartItems
    .filter((item) => selectedItems.includes(item.item_codigo))
    .reduce(
      (acc, item) => acc + item.quantidade * Number(item.produto_preco),
      0,
    );

  const handleItemRemove = (codigo) => {
    setCartItems((prev) => prev.filter((item) => item.item_codigo !== codigo));
    setSelectedItems((prev) =>
      prev.filter((itemCodigo) => itemCodigo !== codigo),
    );

    startTransition(() => {
      removeFromCart(codigo);
    });
  };

  // Nova função para atualizar a quantidade via PUT
  const handleQuantityChange = async (itemCodigo, novaQuantidade) => {
    if (isNaN(novaQuantidade) || novaQuantidade < 1) return;

    // Atualização otimista: muda o estado local imediatamente para recalcular o total na hora
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.item_codigo === itemCodigo
          ? { ...item, quantidade: novaQuantidade }
          : item,
      ),
    );

    try {
      const response = await fetch(
        `http://localhost:3001/itens-carrinho/${itemCodigo}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")?.replaceAll('"', "")}`,
          },
          body: JSON.stringify({ quantidade: novaQuantidade }),
        },
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        setMessage(
          errData.message || "Erro ao atualizar a quantidade do item.",
        );
      }
    } catch (error) {
      console.error("Erro ao alterar quantidade:", error);
      setMessage("Erro de conexão ao atualizar a quantidade.");
    }
  };

  const toggleItemSelection = (codigo) => {
    setSelectedItems((prev) =>
      prev.includes(codigo)
        ? prev.filter((item_codigo) => item_codigo !== codigo)
        : [...prev, codigo],
    );
  };

  const handleFinishPurchase = async () => {
    if (!selectedItems.length) {
      setMessage("Selecione pelo menos um item para finalizar a compra.");
      return;
    }

    try {
      setMessage("Finalizando pedido...");
      const response = await fetch("http://localhost:3001/pedidos/finalizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigoCliente,
          itens: cartItems
            .filter((item) => selectedItems.includes(item.item_codigo))
            .map((item) => ({
              item_codigo: item.item_codigo,
              codigo: item.item_codigo,
            })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Erro ao finalizar pedido.");
      }

      setMessage(`Pedido criado com sucesso! Código: ${data.codigoPedido}`);

      setCartItems((prev) =>
        prev.filter((item) => !selectedItems.includes(item.item_codigo)),
      );
      setSelectedItems([]);
    } catch (err) {
      console.error("Erro ao finalizar pedido:", err);
      setMessage(err.message || "Erro ao finalizar pedido.");
    }
  };

  return (
    <div className="App">
      <HomeHeader />
      <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "1.5rem" }}>Meu Carrinho</h1>

        {isLoading ? (
          <p style={{ fontSize: "16px" }}>Carregando seu carrinho...</p>
        ) : error ? (
          <p
            style={{
              color: "var(--danger, #b42318)",
              fontWeight: "bold",
              padding: "1rem",
              background: "var(--danger-bg, #fef3f2)",
              borderRadius: "8px",
            }}
          >
            Ocorreu um erro: {error}
          </p>
        ) : cartItems?.length ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
          >
            {/* Tabela de Itens */}
            <div style={tableContainerStyle}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}
              >
                <thead
                  style={{
                    background: "var(--bg)",
                    color: "white",
                  }}
                >
                  <tr>
                    <th
                      style={{ ...thStyle, width: "50px", textAlign: "center" }}
                    >
                      ✔
                    </th>
                    <th style={thStyle}>Produto</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>
                      Quantidade
                    </th>
                    <th style={thStyle}>Preço Un.</th>
                    <th style={thStyle}>Subtotal</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.item_codigo} style={trStyle}>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.item_codigo)}
                          onChange={() => toggleItemSelection(item.item_codigo)}
                          style={{
                            width: "18px",
                            height: "18px",
                            cursor: "pointer",
                          }}
                        />
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                        }}
                      >
                        {item.produto_nome}
                      </td>
                      {/* Ajustado o campo de quantidade mantendo o estilo original */}
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <input
                          type="number"
                          min="1"
                          value={item.quantidade}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.item_codigo,
                              parseInt(e.target.value, 10),
                            )
                          }
                          style={{
                            ...qtdBadgeStyle,
                            width: "65px",
                            textAlign: "center",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                      </td>
                      <td style={{ ...tdStyle }}>
                        {formatPrice(item.produto_preco)}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          fontWeight: "bold",
                          color: "var(--accent, #0d6efd)",
                        }}
                      >
                        {formatPrice(item.quantidade * item.produto_preco)}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <button
                          onClick={() => handleItemRemove(item.item_codigo)}
                          style={deleteBtnStyle}
                          title="Remover do carrinho"
                          disabled={isPending}
                        >
                          <FaTrash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resumo da Compra */}
            <div style={summaryCardStyle}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "5px" }}
              >
                <span style={{ fontSize: "16px" }}>
                  Subtotal dos itens selecionados:
                </span>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "32px",
                  }}
                >
                  {formatPrice(cartTotal)}
                </h2>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  onClick={handleFinishPurchase}
                  disabled={!selectedItems.length}
                  style={checkoutButtonStyle(selectedItems.length > 0)}
                >
                  Finalizar Compra
                </button>
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
            </div>
          </div>
        ) : (
          <div style={emptyCartStyle}>
            <h2 style={{}}>Seu carrinho está vazio.</h2>
            <p style={{ color: "var(--text, #333)" }}>
              Volte à loja e adicione alguns produtos!
            </p>
            <button
              onClick={() => navigate("/")}
              style={continueShoppingBtnStyle}
            >
              Continuar Comprando
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const tableContainerStyle = {
  overflowX: "auto",
  background: "var(--secondary-bg, white)",
  borderRadius: "8px",
  border: "1px solid var(--border, #e5e7eb)",
  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
};

const thStyle = {
  padding: "16px",
  fontWeight: "bold",
  fontSize: "14px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const tdStyle = {
  padding: "16px",
  verticalAlign: "middle",
};

const trStyle = {
  borderBottom: "1px solid var(--border, #e5e7eb)",
  transition: "background-color 0.2s",
};

const qtdBadgeStyle = {
  background: "var(--accent-bg)",
  padding: "6px 12px",
  borderRadius: "20px",
  fontWeight: "bold",
  border: "1px solid var(--accent-border)",
};

const deleteBtnStyle = {
  background: "transparent",
  border: "none",
  color: "var(--danger, #ef4444)",
  cursor: "pointer",
  padding: "8px",
  borderRadius: "4px",
  transition: "background-color 0.2s",
};

const summaryCardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "var(--secondary-bg)",
  padding: "2rem",
  borderRadius: "12px",
  border: "1px solid var(--border)",
  flexWrap: "wrap",
  gap: "1rem",
};

const checkoutButtonStyle = (isActive) => ({
  padding: "16px 32px",
  background: isActive ? "var(--accent)" : "var(--border, #ccc)",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: isActive ? "pointer" : "not-allowed",
  fontSize: "18px",
  fontWeight: "bold",
  transition: "all 0.2s",
});

const emptyCartStyle = {
  textAlign: "center",
  padding: "4rem 2rem",
  background: "var(--bg)",
  borderRadius: "12px",
  border: "2px dashed var(--border)",
};

const continueShoppingBtnStyle = {
  marginTop: "1rem",
  padding: "12px 24px",
  background: "var(--secondary-bg, white)",
  color: "var(--accent)",
  border: "2px solid var(--accent)",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
};

export default CarrinhoPage;
