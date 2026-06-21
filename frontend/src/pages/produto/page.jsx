import { startTransition, useActionState, useEffect, useState } from "react";
import HomeHeader from "../../components/HomeHeader";
import { useLocation, useNavigate } from "react-router-dom";
import { getCodigoCliente } from "../../helpers/page-helper";

const ProdutoPage = () => {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantidade, setQuantidade] = useState(1);

  const [state, addToCart, isPending] = useActionState(
    async (prevState, { codigo, quantidade = 1 }) => {
      const codigoCliente = getCodigoCliente();

      try {
        const response = await fetch(
          "http://localhost:3001/carrinhos/adicionar",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")?.replaceAll('"', "")}`,
            },
            body: JSON.stringify({
              codigoProduto: codigo,
              codigoCliente,
              quantidade,
            }),
          },
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          return {
            success: false,
            error: errData.message || "Erro ao adicionar.",
          };
        }

        // Retorna sucesso para o estado
        return { success: true, message: "Produto adicionado ao carrinho!" };
      } catch (error) {
        console.error("Erro no addToCart:", error);
        return { success: false, error: "Erro de conexão com o servidor." };
      }
    },
    null,
  );

  const location = useLocation();
  const navigate = useNavigate();
  const { codigo } = location.state || {};

  useEffect(() => {
    if (!codigo) {
      setError("Código do produto não fornecido.");
      setIsLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/produtos/${codigo}`,
        );
        if (!response.ok) {
          throw new Error("Erro ao buscar produto: " + response.statusText);
        }
        const data = await response.json();

        setProduct(data.produto || data);
      } catch (error) {
        console.error("Erro na requisição:", error);
        setError("Não foi possível carregar os detalhes deste produto.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [codigo]);

  // Função para formatar o preço em Reais (BRL)
  const formatPrice = (price) => {
    return Number(price).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Trava para garantir que a quantidade digitada não ultrapasse o estoque
  const handleQuantidadeChange = (e) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > product.quantidade_estoque) val = product.quantidade_estoque;
    setQuantidade(val);
  };

  return (
    <div className="App">
      <HomeHeader hasBanner={true} />

      <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
        {/* Botão de Voltar */}
        <button onClick={() => navigate(-1)} style={backButtonStyle}>
          &larr; Voltar para a loja
        </button>

        {isLoading ? (
          <p
            style={{ textAlign: "center", marginTop: "2rem", fontSize: "18px" }}
          >
            Carregando detalhes do produto...
          </p>
        ) : error ? (
          <p
            style={{
              color: "red",
              textAlign: "center",
              marginTop: "2rem",
              fontWeight: "bold",
            }}
          >
            {error}
          </p>
        ) : product ? (
          <div style={cardStyle}>
            {/* Informações da Direita (Expandido para ocupar o espaço) */}
            <div style={detailsStyle}>
              <h1
                style={{
                  marginTop: 0,
                  marginBottom: "0.5rem",
                  fontSize: "28px",
                }}
              >
                {product.nome}
              </h1>

              <div style={priceContainerStyle}>
                <span style={priceStyle}>{formatPrice(product.preco)}</span>
                <span style={stockBadgeStyle(product.quantidade_estoque)}>
                  {product.quantidade_estoque > 0
                    ? `${product.quantidade_estoque} em estoque`
                    : "Fora de estoque"}
                </span>
              </div>

              {/* Caixa da Descrição */}
              <div style={descriptionStyle}>
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "16px",
                    color: "white",
                  }}
                >
                  Descrição do Produto
                </h3>
                <p
                  style={{
                    margin: 0,
                    lineHeight: "1.6",
                    color: "var(--text, #555)",
                  }}
                >
                  {product.descricao ||
                    "Nenhuma descrição detalhada disponível para este produto no momento."}
                </p>
              </div>

              {/* Seletor de Quantidade */}
              {product.quantidade_estoque > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "1rem",
                  }}
                >
                  <label
                    htmlFor="qtd"
                    style={{ fontWeight: "bold", fontSize: "16px" }}
                  >
                    Quantidade:
                  </label>
                  <input
                    id="qtd"
                    type="number"
                    min="1"
                    max={product.quantidade_estoque}
                    value={quantidade}
                    onChange={handleQuantidadeChange}
                    style={inputQuantityStyle}
                  />
                </div>
              )}

              {/* Botão de Ação */}
              <button
                style={addToCartButtonStyle(product.quantidade_estoque)}
                disabled={product.quantidade_estoque <= 0 || isPending}
                onClick={() =>
                  startTransition(() => {
                    addToCart({ codigo: product.codigo, quantidade });
                  })
                }
              >
                {isPending
                  ? "Adicionando..."
                  : product.quantidade_estoque > 0
                    ? "Adicionar ao Carrinho"
                    : "Produto Indisponível"}
              </button>

              {/* Mensagens de Feedback da Action */}
              {state?.success && (
                <p
                  style={{
                    color: "#0a5",
                    fontWeight: "bold",
                    margin: "8px 0 0 0",
                    textAlign: "center",
                  }}
                >
                  {state.message}
                </p>
              )}
              {state?.error && (
                <p
                  style={{
                    color: "red",
                    fontWeight: "bold",
                    margin: "8px 0 0 0",
                    textAlign: "center",
                  }}
                >
                  {state.error}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p style={{ textAlign: "center", marginTop: "2rem" }}>
            Produto não encontrado.
          </p>
        )}
      </div>
    </div>
  );
};

const backButtonStyle = {
  background: "transparent",
  border: "none",
  color: "var(--accent, #007bff)",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
  marginBottom: "1.5rem",
  padding: 0,
};

const cardStyle = {
  display: "flex",
  gap: "2.5rem",
  background: "var(--secondary-bg, #fff)",
  padding: "2rem",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  border: "1px solid var(--border, #eee)",
  flexWrap: "wrap",
};

const detailsStyle = {
  flex: "1",
  minWidth: "300px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const priceContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  marginBottom: "1.5rem",
};

const priceStyle = {
  fontSize: "32px",
  fontWeight: "900",
  color: "var(--accent, #0d6efd)",
};

const stockBadgeStyle = (qtd) => ({
  fontSize: "14px",
  fontWeight: "bold",
  padding: "6px 12px",
  borderRadius: "20px",
  background: qtd > 0 ? "#d1e7dd" : "#f8d7da",
  color: qtd > 0 ? "#0f5132" : "#842029",
});

const descriptionStyle = {
  background: "var(--bg, #f8f9fa)",
  padding: "1.25rem",
  borderRadius: "8px",
  marginBottom: "1rem",
  borderLeft: "4px solid var(--accent, #0d6efd)",
};

const inputQuantityStyle = {
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid var(--border, #ccc)",
  fontSize: "16px",
  width: "80px",
  textAlign: "center",
};

const addToCartButtonStyle = (qtd) => ({
  padding: "16px 24px",
  background: qtd > 0 ? "var(--accent, #0d6efd)" : "#ccc",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "18px",
  fontWeight: "bold",
  cursor: qtd > 0 ? "pointer" : "not-allowed",
  marginTop: "1rem",
  transition: "opacity 0.2s",
  width: "100%",
});

export default ProdutoPage;
