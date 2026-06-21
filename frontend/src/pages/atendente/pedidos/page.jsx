import { useEffect, useState } from "react";
import HomeHeader from "../../../components/HomeHeader";

const API_BASE = "http://localhost:3001";

const PedidosAtendentePage = () => {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/atendente/pedidos`)
      .then((response) => response.json())
      .then((data) => setPedidos(data?.pedidos ?? []))
      .catch(() => setPedidos([]));
  }, []);

  return (
    <div className="App">
      <HomeHeader hasBanner={false} />
      <div style={{ padding: "1.5rem", maxWidth: "900px", margin: "0 auto" }}>
        <h1>Pedidos</h1>
        <p>Consulta dos pedidos registrados na operação de atendimento.</p>
        <ul style={{ display: "grid", gap: "0.75rem", paddingLeft: "1rem" }}>
          {pedidos.map((pedido) => (
            <li key={pedido.codigo} style={{ background: "var(--secondary-bg)", borderRadius: "8px", padding: "0.75rem", border: "1px solid var(--border)" }}>
              <strong>Pedido #{pedido.codigo}</strong> — {pedido.status || "—"}<br />
              Valor: R$ {Number(pedido.valor ?? 0).toFixed(2)} | Conta: {pedido.codigo_conta ?? "—"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PedidosAtendentePage;
