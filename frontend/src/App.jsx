import { Route, Routes } from "react-router-dom";
import "./App.css";
import {
  HomePage,
  LoginPage,
  RegisterPage,
  ProdutoPage,
  CarrinhoPage,
  AdminPage,
  AdminUsuariosPage,
  AdminNovoUsuarioPage,
  AdminEditarUsuarioPage,
  AdminProdutosPage,
  AdminNovoProdutoPage,
  AdminEditarProdutoPage,
  AdminRelatoriosPage,
  AdminRelatorioSlugPage,
  AtendentePage,
  AtendenteVendaTelefonePage,
  AtendenteClientesNovoPage,
  AtendentePedidosPage,
  AtendentePedidosStatusPage,
  AtendentePagamentosPage,
  AtendenteConsultarClientesPage,
  AtendenteConsultarEstoquePage,
  AtendenteConsultarCarrinhosPage,
  PedidosPage,
  PagamentoPage,
  EnderecosPage,
  EnderecoEditPage,
} from "./pages/index.js";
import { useIsAuthenticated } from "./hooks/useIsAuthenticated.js";
import { getPerfilCliente } from "./helpers/page-helper.js";

function App() {
  const isAuthenticated = useIsAuthenticated();
  const isAdmin = isAuthenticated && getPerfilCliente() === "admin";
  const isAtendente = isAuthenticated && getPerfilCliente() === "atendente";

  const adminPages = [
    <Route path="/" element={<HomePage />} />,
    <Route path="/admin" element={<AdminPage />} />,
    <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />,
    <Route path="/admin/usuarios/novo" element={<AdminNovoUsuarioPage />} />,
    <Route path="/admin/usuarios/:id" element={<AdminEditarUsuarioPage />} />,
    <Route path="/admin/produtos" element={<AdminProdutosPage />} />,
    <Route path="/admin/produtos/novo" element={<AdminNovoProdutoPage />} />,
    <Route path="/admin/produtos/:id" element={<AdminEditarProdutoPage />} />,
    <Route path="/admin/relatorios" element={<AdminRelatoriosPage />} />,
    <Route
      path="/admin/relatorios/:slug"
      element={<AdminRelatorioSlugPage />}
    />,
  ];

  const atendentePages = [
    <Route path="/" element={<HomePage />} />,
    <Route path="/atendente" element={<AtendentePage />} />,
    <Route
      path="/atendente/venda-telefone"
      element={<AtendenteVendaTelefonePage />}
    />,
    <Route
      path="/atendente/clientes/novo"
      element={<AtendenteClientesNovoPage />}
    />,
    <Route path="/atendente/pedidos" element={<AtendentePedidosPage />} />,
    <Route
      path="/atendente/pedidos/status"
      element={<AtendentePedidosStatusPage />}
    />,
    <Route
      path="/atendente/pagamentos"
      element={<AtendentePagamentosPage />}
    />,
    <Route
      path="/atendente/consultar/clientes"
      element={<AtendenteConsultarClientesPage />}
    />,
    <Route
      path="/atendente/consultar/estoque"
      element={<AtendenteConsultarEstoquePage />}
    />,
    <Route
      path="/atendente/consultar/carrinhos"
      element={<AtendenteConsultarCarrinhosPage />}
    />,
  ];

  const clientePages = [
    <Route path="/" element={<HomePage />} />,
    <Route path="/produto" element={<ProdutoPage />} />,
    <Route path="/carrinho" element={<CarrinhoPage />} />,
    <Route path="/pedidos" element={<PedidosPage />} />,
    <Route path="/pagamento" element={<PagamentoPage />} />,
    <Route path="/enderecos" element={<EnderecosPage />} />,
    <Route path="/endereco/:id" element={<EnderecoEditPage />} />,
  ];

  return (
    <Routes>
      {!isAuthenticated
        ? [
            <Route path="/" element={<HomePage />} />,
            <Route path="/login" element={<LoginPage />} />,
            <Route path="/register" element={<RegisterPage />} />,
          ]
        : isAdmin
          ? adminPages
          : isAtendente
            ? atendentePages
            : clientePages}
    </Routes>
  );
}

export default App;
