import { useEffect, useState } from "react";
import HomeHeader from "../../../components/HomeHeader";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const API_BASE = "http://localhost:3001";

const AtendentePagamentosPage = () => {
  const [pedidoId, setPedidoId] = useState("");
  const [pagamentosList, setPagamentosList] = useState([]);
  const [pedidoInfo, setPedidoInfo] = useState(null);
  const [enderecoId, setEnderecoId] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.enderecoId) {
      setEnderecoId(location.state.enderecoId);
    }
  }, [location.state]);

  const handleNavigateToEnderecos = () => {
    if (!pedidoInfo) {
      setMessage("Busque um pedido primeiro.");
      return;
    }

    navigate("/enderecos", {
      state: {
        pedidoId: pedidoInfo.codigo,
        clienteId: pedidoInfo.codigo_cliente,
        valorTotal: Number(pedidoInfo.valor),
        returnTo: "/atendente/pagamentos",
      },
    });
  };

  const buscarPedido = async () => {
    if (!pedidoId.trim()) {
      setMessage("Informe um código de pedido.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/pedidos/${pedidoId}`);
      const data = await res.json();

      if (res.ok) {
        setPedidoInfo(data);
        setMessage("");
      } else {
        setPedidoInfo(null);
        setMessage("Pedido não encontrado.");
      }
    } catch (error) {
      console.error(error);
      setPedidoInfo(null);
      setMessage("Erro ao buscar pedido.");
    }
  };

  // Estado para a parte do pagamento que está sendo configurada no momento
  const [currentPayment, setCurrentPayment] = useState({
    forma: "cartão",
    valor: "",
    parcelas: 1,
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!pedidoInfo) return;
    setCurrentPayment((prev) => {
      return {
        ...prev,
        valor: pedidoInfo.valor,
      };
    });
  }, [pedidoInfo]);

  // Adiciona uma linha de pagamento ao rascunho
  const handleAddPaymentRow = () => {
    if (!pedidoId.trim()) {
      setMessage("Por favor, digite o código do pedido primeiro.");
      return;
    }

    const valorDigitado = Number(currentPayment.valor);
    if (valorDigitado <= 0) {
      setMessage("O valor do pagamento deve ser maior que zero.");
      return;
    }

    setPagamentosList([
      ...pagamentosList,
      {
        forma: currentPayment.forma,
        valor: valorDigitado,
        parcelas:
          currentPayment.forma === "cartão"
            ? Number(currentPayment.parcelas)
            : 1,
      },
    ]);

    // Reseta apenas os campos do pagamento atual
    setCurrentPayment({ forma: "cartão", valor: "", parcelas: 1 });
    setMessage("");
  };

  // Remove uma linha de pagamento do rascunho
  const handleRemovePaymentRow = (index) => {
    setPagamentosList(pagamentosList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!enderecoId) {
      setMessage("Selecione um endereço antes de processar o pagamento.");
      return;
    }

    if (!pedidoId.trim()) {
      setMessage("Código do pedido é obrigatório.");
      return;
    }

    if (pagamentosList.length === 0) {
      setMessage("Adicione pelo menos uma forma de pagamento à lista.");
      return;
    }

    setIsLoading(true);
    setMessage("Registrando lote de pagamentos...");

    try {
      const response = await fetch(`${API_BASE}/atendente/pagamentos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigoPedido: Number(pedidoId),
          pagamentos: pagamentosList,
          codigoEndereco: Number(enderecoId),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          data?.message || "Todos os pagamentos foram registrados com sucesso!",
        );
        // Limpa tudo após o sucesso
        setPedidoId("");
        setPedidoInfo(null);
        setEnderecoId("");
        setPagamentosList([]);
      } else {
        setMessage(data?.message || "Falha ao registrar pagamentos.");
      }
    } catch (error) {
      setMessage("Erro de conexão com o backend.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalAcumulado = pagamentosList.reduce((acc, p) => acc + p.valor, 0);

  return (
    <div className="App">
      <HomeHeader hasBanner={false} />
      <div style={{ padding: "1.5rem", maxWidth: "700px", margin: "0 auto" }}>
        <h2>Painel do Atendente - Registrar Pagamentos</h2>
        <p>
          Lançamento manual de múltiplos pagamentos e parcelas para vendas
          internas ou suporte.
        </p>

        {/* BLOCO principal */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            marginTop: "1.5rem",
          }}
        >
          {/* Identificação do Pedido */}
          <div style={sectionStyle}>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="number"
                placeholder="Ex: 42"
                value={pedidoId}
                onChange={(e) => setPedidoId(e.target.value)}
                disabled={pagamentosList.length > 0}
                style={{ ...inputStyle, flex: 1 }}
              />

              <button
                type="button"
                onClick={buscarPedido}
                style={secondaryButtonStyle}
              >
                Buscar
              </button>
            </div>
            {pagamentosList.length > 0 && (
              <span
                style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}
              >
                Para alterar o pedido, limpe a lista de pagamentos abaixo.
              </span>
            )}
          </div>

          {pedidoInfo && (
            <div
              style={{
                padding: "1rem",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                background: "var(--secondary-bg)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h3 style={{ margin: 0 }}>Endereço de Entrega</h3>

                  {enderecoId ? (
                    <span style={{ color: "#0a5", fontWeight: "bold" }}>
                      Endereço #{enderecoId} vinculado
                    </span>
                  ) : (
                    <span style={{ color: "red" }}>
                      Nenhum endereço selecionado
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleNavigateToEnderecos}
                  style={secondaryButtonStyle}
                >
                  {enderecoId ? "Trocar Endereço" : "+ Adicionar Endereço"}
                </button>
              </div>
            </div>
          )}

          {/* Configuração do pagamento atual */}
          <div style={sectionStyle}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
              Inserir Fração de Pagamento
            </h3>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <select
                value={currentPayment.forma}
                onChange={(e) =>
                  setCurrentPayment({
                    ...currentPayment,
                    forma: e.target.value,
                  })
                }
                style={{ flex: 1, ...inputStyle }}
              >
                <option value="cartão">Cartão de Crédito</option>
                <option value="pix">Pix</option>
                <option value="boleto">Boleto</option>
              </select>

              {currentPayment.forma === "cartão" && (
                <select
                  value={currentPayment.parcelas}
                  onChange={(e) =>
                    setCurrentPayment({
                      ...currentPayment,
                      parcelas: e.target.value,
                    })
                  }
                  style={{ width: "90px", ...inputStyle }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                    <option key={num} value={num}>
                      {num}x
                    </option>
                  ))}
                </select>
              )}

              <input
                type="number"
                step="0.01"
                placeholder="Valor (R$)"
                value={currentPayment.valor}
                onChange={(e) =>
                  setCurrentPayment({
                    ...currentPayment,
                    valor: e.target.value,
                  })
                }
                style={{ flex: 1, ...inputStyle }}
              />
            </div>

            <button
              type="button"
              onClick={handleAddPaymentRow}
              style={secondaryButtonStyle}
            >
              + Vincular à Lista
            </button>
          </div>

          {/* Lista de pagamentos prontos para envio */}
          {pagamentosList.length > 0 && (
            <div style={sectionStyle}>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
                Lote Pronto para Envio
              </h3>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 1rem 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {pagamentosList.map((pag, index) => (
                  <li key={index} style={itemLiStyle}>
                    <span>
                      <strong>{pag.forma.toUpperCase()}</strong>
                      {pag.forma === "cartão" ? ` em ${pag.parcelas}x` : ""}
                    </span>
                    <div>
                      <span style={{ fontWeight: "bold", marginRight: "15px" }}>
                        R$ {pag.valor.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePaymentRow(index)}
                        style={removeBtnStyle}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div
                style={{
                  textAlign: "right",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                Total Acumulado do Lote: R$ {totalAcumulado.toFixed(2)}
              </div>
            </div>
          )}

          {/* Envio final para o Servidor */}
          <form onSubmit={handleSubmit}>
            <button
              type="submit"
              style={buttonStyle}
              disabled={pagamentosList.length === 0 || isLoading}
            >
              {isLoading
                ? "Processando..."
                : "Confirmar e Processar Lote no Banco"}
            </button>
          </form>

          {message && (
            <p
              style={{
                color:
                  message.includes("Erro") ||
                  message.includes("Falha") ||
                  message.includes("primeiro") ||
                  message.includes("pelo menos")
                    ? "red"
                    : "#0a5",
                margin: 0,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Styles internos organizados
const sectionStyle = {
  padding: "1.25rem",
  border: "1px solid var(--border, #ccc)",
  borderRadius: "8px",
  background: "var(--secondary-bg, #fff)",
  display: "flex",
  flexDirection: "column",
};

const inputStyle = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid var(--border, #ccc)",
  fontSize: "14px",
};

const itemLiStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px",
  background: "var(--secondary-bg)",
  border: "1px solid #ddd",
  borderRadius: "6px",
};

const buttonStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "6px",
  border: "none",
  background: "var(--accent, #0d6efd)",
  color: "white",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
};

const secondaryButtonStyle = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #6c757d",
  background: "#6c757d",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
  marginTop: "12px",
  fontSize: "14px",
};

const removeBtnStyle = {
  color: "red",
  border: "none",
  background: "none",
  cursor: "pointer",
  fontWeight: "bold",
};

export default AtendentePagamentosPage;
