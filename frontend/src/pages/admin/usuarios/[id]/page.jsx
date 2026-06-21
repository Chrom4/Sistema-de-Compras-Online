import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HomeHeader from "../../../../components/HomeHeader";

const EditarUsuarioPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    login: "",
    senha: "",
    perfil: "cliente",
    status: "novo",
    codigo_cliente: "",
  });

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await fetch(`http://localhost:3001/usuarios/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar usuário");
        const data = await response.json();
        setForm({
          login: data.login || "",
          senha: "",
          perfil: data.perfil || "cliente",
          status: data.status || "novo",
          codigo_cliente: data.codigo_cliente || "",
        });
      } catch (err) {
        alert(err.message || "Erro ao carregar usuário");
        navigate("/admin/usuarios");
      }
    };

    fetchUsuario();
  }, [id, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const body = {
        login: form.login,
        perfil: form.perfil,
        status: form.status,
        codigo_cliente: Number(form.codigo_cliente || 0),
      };

      if (form.senha) body.senha = form.senha;

      const response = await fetch(`http://localhost:3001/usuarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Erro ao atualizar usuário");

      alert("Usuário atualizado com sucesso!");
      navigate("/admin/usuarios");
    } catch (err) {
      alert(err.message || "Erro ao atualizar usuário");
    }
  };

  return (
    <div className="App">
      <HomeHeader />
      <div style={{ padding: "1.5rem", maxWidth: "700px", margin: "0 auto" }}>
        <h1>Editar Usuário</h1>
        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: "0.75rem" }}
        >
          <input
            name="login"
            value={form.login}
            placeholder="Login"
            required
            onChange={handleChange}
          />
          <input
            name="senha"
            type="password"
            value={form.senha}
            placeholder="Nova senha (opcional)"
            onChange={handleChange}
          />
          <input
            name="codigo_cliente"
            type="number"
            value={form.codigo_cliente}
            placeholder="Código do cliente"
            onChange={handleChange}
          />
          <select name="perfil" value={form.perfil} onChange={handleChange}>
            <option value="cliente">cliente</option>
            <option value="admin">admin</option>
          </select>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="novo">novo</option>
            <option value="ativo">ativo</option>
            <option value="bloqueado">bloqueado</option>
            <option value="banido temporariamente">
              banido temporariamente
            </option>
          </select>
          <button type="submit" style={buttonStyle}>
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
};

const buttonStyle = {
  padding: "10px 14px",
  borderRadius: "6px",
  border: "none",
  background: "var(--accent, #0d6efd)",
  color: "white",
  cursor: "pointer",
};

export default EditarUsuarioPage;
