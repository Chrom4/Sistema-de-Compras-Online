import { useState, useEffect, useActionState, startTransition } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAuthenticated } from "../hooks/useIsAuthenticated";
import { getCodigoCliente } from "../helpers/page-helper";

const ProductPanel = ({ searchText }) => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();

  const [state, addToCart, isPending] = useActionState(
    async (prevState, codigoProduto) => {
      const codigoCliente = getCodigoCliente();

      try {
        const response = await fetch(
          "http://localhost:3001/carrinhos/adicionar",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token").replaceAll('"', "")}`,
            },
            body: JSON.stringify({
              codigoProduto,
              codigoCliente,
              quantidade: 1,
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:3001/produtos/");
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          throw new Error("Erro ao buscar produtos: " + response.statusText);
        }
      } catch (error) {
        console.error("Erro na requisição:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (e, codigoProduto, action) => {
    const throwAlert = (str) =>
      alert(`${str} não disponível - Faça login para acessar`);

    switch (action) {
      case "nav":
        if (!isAuthenticated) return throwAlert("Página");

        navigate("/produto", { state: { codigo: codigoProduto } });
        break;

      case "add":
        e.stopPropagation();
        if (!isAuthenticated) return throwAlert("Ação");

        startTransition(() => {
          addToCart(codigoProduto);
        });
        break;
      default:
        break;
    }
  };

  const filteredProducts = products?.filter((product) =>
    product.nome.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div>
      <h3>Produtos</h3>

      {state?.success && <div style={{ color: "green" }}>{state.message}</div>}
      {state?.error && <div style={{ color: "red" }}>{state.error}</div>}

      {isPending && <p>Adicionando ao carrinho...</p>}

      <div className="ProductPanel">
        {filteredProducts.map((product) => (
          <div
            key={product.codigo}
            className="ProductCard"
            onClick={(e) => handleProductClick(e, product.codigo, "nav")}
          >
            <h3>{product.nome}</h3>
            <p>Preço: R$ {parseFloat(product.preco).toLocaleString()}</p>
            <p>Em estoque: {product.quantidade_estoque}</p>

            {product.quantidade_estoque > 0 && (
              <button
                className="ProductCardButton"
                disabled={isPending}
                onClick={(e) => handleProductClick(e, product.codigo, "add")}
              >
                Adicionar ao Carrinho
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductPanel;
