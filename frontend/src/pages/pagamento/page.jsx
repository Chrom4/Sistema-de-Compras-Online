import { useState } from "react";
import HomeHeader from "../../components/HomeHeader";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3001";

const PagamentoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const pedidoId = location.state?.pedidoId || "";
  const valorTotalPedido = Number(location.state?.valorTotal || 0);
  const enderecoId = location.state?.enderecoId || "";

  // Estado para armazenar os múltiplos pagamentos adicionados
  const [pagamentosList, setPagamentosList] = useState([]);

  // Estado para os campos do pagamento que está sendo digitado agora
  const [currentPayment, setCurrentPayment] = useState({
    forma: "cartão",
    valor: "",
    parcelas: 1,
  });

  const [message, setMessage] = useState("");

  // Matemática em tempo real
  const valorJaPago = pagamentosList.reduce((acc, p) => acc + p.valor, 0);
  const valorRestante = Number((valorTotalPedido - valorJaPago).toFixed(2));
  const isPagoTotalmente = valorRestante === 0;

  // Função para adicionar uma parte do pagamento à lista
  const handleAddPayment = () => {
    const valorDigitado = Number(currentPayment.valor);

    console.log(valorDigitado, valorRestante);
    if (valorDigitado <= 0) {
      setMessage("O valor deve ser maior que zero.");
      return;
    }
    if (valorDigitado > valorRestante) {
      setMessage(`O valor excede o restante (R$ ${valorRestante.toFixed(2)}).`);
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

    // Reseta o input e joga o valor restante como sugestão
    setCurrentPayment({
      forma: "cartão",
      valor: (valorRestante - valorDigitado).toFixed(2),
      parcelas: 1,
    });
    setMessage("");
  };

  const handleRemovePayment = (index) => {
    setPagamentosList(pagamentosList.filter((_, i) => i !== index));
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!enderecoId) {
      setMessage(
        "Por favor, vincule um endereço antes de registrar o pagamento.",
      );
      return;
    }

    if (!isPagoTotalmente) {
      setMessage("O pedido ainda não foi totalmente pago.");
      return;
    }

    setMessage("Registrando pagamentos...");
    try {
      const response = await fetch(`${API_BASE}/atendente/pagamentos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigoPedido: Number(pedidoId),
          pagamentos: pagamentosList, // Agora enviamos o array inteiro!
          codigoEndereco: enderecoId,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage("Pagamento registrado com sucesso!");
        setTimeout(() => navigate("/pedidos"), 2000); // Tira o atendente da tela
      } else {
        setMessage(data?.message || "Falha ao registrar pagamento.");
      }
    } catch (error) {
      setMessage("Erro de conexão com o backend.");
      console.error(error);
    }
  };

  const handleNavigateToEnderecos = () => {
    navigate("/enderecos", {
      state: {
        pedidoId,
        valorTotal: valorTotalPedido,
        returnTo: "/pagamento",
      },
    });
  };

  return (
    <div className="App">
      <HomeHeader hasBanner={false} />
      <div style={{ padding: "1.5rem", maxWidth: "700px", margin: "0 auto" }}>
        <h1>Pagamento Múltiplo</h1>
        <p>Divida o pagamento em diferentes formas e parcelas se necessário.</p>

        {/* SESSÃO 1: RESUMO DO PEDIDO E ENDEREÇO */}
        <div
          style={{
            padding: "1rem",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            background: "var(--secondary-bg)",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 4px 0" }}>Endereço de Entrega</h3>
              {enderecoId ? (
                <span style={{ color: "#0a5", fontWeight: "bold" }}>
                  Endereço #{enderecoId} vinculado!
                </span>
              ) : (
                <span style={{ color: "red", fontSize: "14px" }}>
                  Nenhum endereço selecionado.
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleNavigateToEnderecos}
              style={{
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid var(--accent)",
                background: "transparent",
                color: "var(--accent)",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {enderecoId ? "Trocar Endereço" : "+ Adicionar Endereço"}
            </button>
          </div>

          <hr style={{ borderTop: "1px solid #ccc", margin: "1rem 0" }} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "18px",
            }}
          >
            <strong>Total do Pedido #{pedidoId}:</strong>
            <strong>R$ {valorTotalPedido.toFixed(2)}</strong>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "#0a5",
              marginTop: "4px",
            }}
          >
            <span>Valor Pago:</span>
            <span>R$ {valorJaPago.toFixed(2)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: valorRestante > 0 ? "red" : "#666",
              marginTop: "4px",
              fontWeight: "bold",
            }}
          >
            <span>Restante:</span>
            <span>R$ {valorRestante.toFixed(2)}</span>
          </div>
        </div>

        {/* SESSÃO 2: ADICIONAR PARTE DO PAGAMENTO */}
        {!isPagoTotalmente && (
          <div
            style={{
              display: "grid",
              gap: "1rem",
              padding: "1rem",
              border: "1px solid #ccc",
              borderRadius: "8px",
              marginBottom: "1.5rem",
            }}
          >
            <h3 style={{ margin: 0 }}>Adicionar Pagamento</h3>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <select
                value={currentPayment.forma}
                onChange={(e) =>
                  setCurrentPayment({
                    ...currentPayment,
                    forma: e.target.value,
                  })
                }
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                }}
              >
                <option value="cartão">Cartão</option>
                <option value="pix">Pix</option>
                <option value="boleto">Boleto</option>
              </select>

              {/* Só exibe parcelas se for Cartão */}
              {currentPayment.forma === "cartão" && (
                <select
                  value={currentPayment.parcelas}
                  onChange={(e) =>
                    setCurrentPayment({
                      ...currentPayment,
                      parcelas: e.target.value,
                    })
                  }
                  style={{
                    width: "80px",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                  }}
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
                placeholder={`Máx: ${valorRestante.toFixed(2)}`}
                value={currentPayment.valor}
                onChange={(e) =>
                  setCurrentPayment({
                    ...currentPayment,
                    valor: e.target.value,
                  })
                }
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleAddPayment}
              style={{ ...buttonStyle, background: "#6c757d" }}
            >
              + Inserir Pagamento
            </button>
          </div>
        )}

        {/* SESSÃO 3: LISTA DE PAGAMENTOS E BOTÃO FINAL */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {pagamentosList.length > 0 && (
            <div>
              <h3 style={{ margin: "0 0 10px 0" }}>Pagamentos Registrados:</h3>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {pagamentosList.map((pag, index) => (
                  <li
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px",
                      background: "#f8f9fa",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                    }}
                  >
                    <span>
                      {pag.forma.toUpperCase()}{" "}
                      {pag.forma === "cartão" ? `(${pag.parcelas}x)` : ""}
                    </span>
                    <div>
                      <span style={{ fontWeight: "bold", marginRight: "15px" }}>
                        R$ {pag.valor.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePayment(index)}
                        style={{
                          color: "red",
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        X
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {message && (
            <p
              style={{
                color:
                  message.includes("Erro") ||
                  message.includes("Falha") ||
                  message.includes("excede") ||
                  message.includes("Por favor")
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

          <button
            type="submit"
            style={buttonStyle}
            disabled={!isPagoTotalmente}
          >
            {isPagoTotalmente
              ? "Registrar e Finalizar Pedido"
              : `Falta pagar R$ ${valorRestante.toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

const buttonStyle = {
  padding: "12px 14px",
  borderRadius: "6px",
  border: "none",
  background: "var(--accent, #0d6efd)",
  color: "white",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
};

export default PagamentoPage;
