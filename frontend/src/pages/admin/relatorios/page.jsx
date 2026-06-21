import { useNavigate } from "react-router-dom";
import HomeHeader from "../../../components/HomeHeader";

const relatorios = [
  {
    slug: "pedidos-conta",
    label: "Pedidos por Conta",
    description:
      "Cruza os dados de pedidos com as contas para listar o histórico e status financeiro.",
  },
  {
    slug: "produtos-carrinho",
    label: "Produtos em Carrinhos",
    description:
      "Detalha os itens, quantidades e calcula o subtotal (R$) preso em carrinhos ativos.",
  },
  {
    slug: "dados-usuarios",
    label: "Demografia de Usuários",
    description:
      "Agrupa e contabiliza os usuários do sistema por perfil de acesso e status da conta.",
  },
  {
    slug: "pagamento-popular",
    label: "Ranking de Pagamentos",
    description:
      "Lista o Top 5 de formas de pagamento mais utilizadas e o volume total transacionado.",
  },
  {
    slug: "filtro-localidade",
    label: "Filtro Geográfico",
    description:
      "Busca avançada de clientes cruzando dados com endereços (Bairro, Cidade e UF).",
  },
  {
    slug: "media-vendas",
    label: "Média Anual de Vendas",
    description:
      "Calcula a média de faturamento (ticket médio) agrupado por ano de operação.",
  },
  {
    slug: "pico-vendas",
    label: "Pico Histórico de Vendas",
    description:
      "Identifica o mês e o ano exatos com o maior volume absoluto de pedidos gerados.",
  },
  {
    slug: "usuarios-fieis",
    label: "Clientes VIPs (Fiéis)",
    description:
      "Filtra clientes de alta retenção que realizaram compras em todos os 12 meses do ano.",
  },
  {
    slug: "produtos-sem-vendas",
    label: "Produtos sem Vendas",
    description:
      "Lista itens do catálogo que ainda não tiveram nenhuma saída em pedidos.",
  },
  {
    slug: "ticket-medio-cliente",
    label: "Clientes mais Valiosos",
    description:
      "Ranking dos 10 clientes que mais geraram receita para a loja.",
  },
];

const RelatoriosPage = () => {
  const navigate = useNavigate();

  return (
    <div className="App">
      <HomeHeader hasBanner={false} />

      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "2rem",
              marginBottom: "0.5rem",
              color: "var(--text, #111)",
            }}
          >
            Inteligência de Negócios
          </h1>
          <p style={{ color: "var(--text-muted, #666)", fontSize: "1.1rem" }}>
            Selecione um dos relatórios consolidados abaixo para extrair dados
            estratégicos do banco de dados.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {relatorios.map((item) => (
            <div
              key={item.slug}
              onClick={() => navigate(`/admin/relatorios/${item.slug}`)}
              style={cardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1)";
                e.currentTarget.style.borderColor = "var(--accent, #0d6efd)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.05)";
                e.currentTarget.style.borderColor = "var(--border, #e5e7eb)";
              }}
            >
              <div style={iconContainerStyle}>{item.icon}</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <h3 style={cardTitleStyle}>{item.label}</h3>
                <p style={cardDescriptionStyle}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const cardStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "1rem",
  padding: "1.5rem",
  borderRadius: "12px",
  border: "1px solid var(--border, #e5e7eb)",
  background: "var(--secondary-bg, #ffffff)",
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
};

const iconContainerStyle = {
  fontSize: "2rem",
  background: "var(--accent-light, #eff6ff)",
  width: "50px",
  height: "50px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "10px",
  flexShrink: 0,
};

const cardTitleStyle = {
  margin: "0 0 0.5rem 0",
  fontSize: "1.1rem",
  fontWeight: "bold",
  color: "var(--text, #1f2937)",
};

const cardDescriptionStyle = {
  margin: 0,
  fontSize: "0.9rem",
  color: "var(--text-muted, #6b7280)",
  lineHeight: "1.4",
};

export default RelatoriosPage;
