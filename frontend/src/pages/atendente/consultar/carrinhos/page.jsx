import { useEffect, useState } from "react";
import HomeHeader from "../../../../components/HomeHeader";

const API_BASE = "http://localhost:3001";

const ConsultarCarrinhosPage = () => {
  const [carrinhos, setCarrinhos] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/atendente/consultar/carrinhos`)
      .then((response) => response.json())
      .then((data) => setCarrinhos(data?.carrinhos ?? []))
      .catch(() => setCarrinhos([]));
  }, []);

  return (
    <div className="App">
      <HomeHeader hasBanner={false} />
      <div style={{ padding: "1.5rem", maxWidth: "900px", margin: "0 auto" }}>
        <h1>Carrinhos Ativos</h1>
        <p>Monitoramento dos carrinhos em uso no atendimento.</p>

        <ul style={{ display: "grid", gap: "0.75rem", paddingLeft: "1rem" }}>
          {carrinhos.map((item) => (
            <li
              key={item.codigo_carrinho}
              style={{
                background: "var(--secondary-bg)",
                borderRadius: "8px",
                padding: "0.75rem",
                border: "1px solid var(--border)",
              }}
            >
              <strong>Carrinho #{item.codigo_carrinho}</strong> —{" "}
              {item.qtd_itens ?? 0} itens
              <br />
              Conta: {item.codigo_conta ?? "—"} | Cliente:{" "}
              {item.codigo_cliente ?? "—"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ConsultarCarrinhosPage;
