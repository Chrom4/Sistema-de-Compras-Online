import { useState } from "react";
import HomeHeader from "../../../../components/HomeHeader";

const API_BASE = "http://localhost:3001";

const PedidoStatusPage = () => {
  const [pedidoId, setPedidoId] = useState("");
  const [status, setStatus] = useState("em processamento");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!pedidoId.trim()) {
      setMessage("Por favor, informe o código do pedido.");
      return;
    }

    setIsLoading(true);
    setMessage("Atualizando...");

    try {
      const response = await fetch(`${API_BASE}/atendente/pedidos/${pedidoId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      
      // Usa a mensagem que veio do backend (que tem aqueles textos legais das regras de transição)
      setMessage(data?.message || (response.ok ? "Status atualizado com sucesso." : "Falha ao atualizar status."));
    } catch (error) {
      setMessage("Erro de conexão com o backend.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <HomeHeader hasBanner={false} />
      <div style={{ padding: "1.5rem", maxWidth: "600px", margin: "0 auto" }}>
        <h2>Atualizar Status do Pedido</h2>
        <p>Modifique o status de um pedido para avançar no fluxo logístico.</p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "14px", fontWeight: "bold" }}>Código do Pedido</label>
            <input 
              type="number" 
              value={pedidoId} 
              onChange={(e) => setPedidoId(e.target.value)} 
              placeholder="Ex: 42" 
              style={inputStyle} 
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "14px", fontWeight: "bold" }}>Novo Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)} 
              style={inputStyle}
            >
              <option value="em processamento">Em processamento</option>
              <option value="confirmado">Confirmado</option>
              <option value="pago">Pago</option>
              <option value="enviado">Enviado</option>
              <option value="em trânsito">Em trânsito</option>
              <option value="entregue">Entregue</option>
              <option value="finalizado">Finalizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <button 
            onClick={handleSave} 
            style={buttonStyle}
            disabled={isLoading}
          >
            {isLoading ? "Salvando..." : "Salvar status"}
          </button>
          
          {message && (
            <p style={{ 
              color: message.includes("Erro") || message.includes("Falha") || message.includes("Por favor") || message.includes("negada") || message.includes("inválida") ? "red" : "#0a5", 
              marginTop: "0.75rem", 
              fontWeight: "bold",
              textAlign: "center"
            }}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid var(--border, #ccc)",
  fontSize: "14px",
  width: "100%",
  boxSizing: "border-box" // Garante que o padding não quebre o tamanho 100%
};

const buttonStyle = { 
  marginTop: "0.5rem", 
  padding: "12px 14px", 
  borderRadius: "6px", 
  border: "none", 
  background: "var(--accent, #0d6efd)", 
  color: "white", 
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px"
};

export default PedidoStatusPage;