import { useEffect, useState } from "react";
import HomeHeader from "../../../../components/HomeHeader";

const API_BASE = "http://localhost:3001";

const ConsultarEstoquePage = () => {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/atendente/consultar/estoque`)
      .then((response) => response.json())
      .then((data) => setProdutos(data?.produtos ?? []))
      .catch(() => setProdutos([]));
  }, []);

  return (
    <div className="App">
      <HomeHeader hasBanner={false} />
      <div style={{ padding: "1.5rem", maxWidth: "900px", margin: "0 auto" }}>
        <h1>Catálogo e Estoque</h1>
        <p>Consulta rápida do inventário disponível para atendimento.</p>
        <ul style={{ display: "grid", gap: "0.75rem", paddingLeft: "1rem" }}>
          {produtos.map((produto) => (
            <li key={produto.codigo} style={{ background: "var(--secondary-bg)", borderRadius: "8px", padding: "0.75rem", border: "1px solid var(--border)" }}>
              <strong>{produto.nome}</strong> — {produto.quantidade_estoque ?? 0} em estoque<br />
              Preço: R$ {Number(produto.preco ?? 0).toFixed(2)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ConsultarEstoquePage;
