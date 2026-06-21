import { useEffect, useState } from "react";
import HomeHeader from "../../../../components/HomeHeader";

const API_BASE = "http://localhost:3001";

const ConsultarClientesPage = () => {
  const [query, setQuery] = useState("");
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadClientes = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/atendente/consultar/clientes?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setClientes(data?.clientes ?? []);
      } catch (error) {
        console.error(error);
        setClientes([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(loadClientes, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="App">
      <HomeHeader hasBanner={false} />
      <div style={{ padding: "1.5rem", maxWidth: "900px", margin: "0 auto" }}>
        <h1>Consultar Cliente</h1>
        <p>Busca por CPF ou nome para suporte ao atendimento.</p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite CPF ou nome"
          style={{ width: "100%", padding: "10px", marginBottom: "1rem" }}
        />
        {loading ? <p>Carregando...</p> : null}
        <ul style={{ display: "grid", gap: "0.75rem", paddingLeft: "1rem" }}>
          {clientes.length ? clientes.map((cliente) => (
            <li key={cliente.codigo} style={{ background: "var(--secondary-bg)", borderRadius: "8px", padding: "0.75rem", border: "1px solid var(--border)" }}>
              <strong>{cliente.nome}</strong> — CPF {cliente.cpf}<br />
              Telefone: {cliente.telefone || "—"}
            </li>
          )) : <li>Nenhum cliente encontrado.</li>}
        </ul>
      </div>
    </div>
  );
};

export default ConsultarClientesPage;
