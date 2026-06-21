import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HomeHeader from "../../../../components/HomeHeader";

const EditarProdutoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: "", quantidade_estoque: "", preco: "", descricao: "" });

  useEffect(() => {
    const fetchProduto = async () => {
      try {
        const response = await fetch(`http://localhost:3001/produtos/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar produto");
        const data = await response.json();
        setForm({
          nome: data.nome || "",
          quantidade_estoque: data.quantidade_estoque || "",
          preco: data.preco || "",
          descricao: data.descricao || "",
        });
      } catch (err) {
        alert(err.message || "Erro ao carregar produto");
        navigate("/admin/produtos");
      }
    };

    fetchProduto();
  }, [id, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3001/produtos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          quantidade_estoque: Number(form.quantidade_estoque || 0),
          preco: Number(form.preco || 0),
          descricao: form.descricao,
        }),
      });
      if (!response.ok) throw new Error("Erro ao atualizar produto");
      alert("Produto atualizado com sucesso!");
      navigate("/admin/produtos");
    } catch (err) {
      alert(err.message || "Erro ao atualizar produto");
    }
  };

  return (
    <div className="App">
      <HomeHeader />
      <div style={{ padding: "1.5rem", maxWidth: "700px", margin: "0 auto" }}>
        <h1>Editar Produto</h1>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
          <input name="nome" value={form.nome} placeholder="Nome" required onChange={handleChange} />
          <input name="quantidade_estoque" type="number" value={form.quantidade_estoque} placeholder="Quantidade em estoque" required onChange={handleChange} />
          <input name="preco" type="number" step="0.01" value={form.preco} placeholder="Preço" required onChange={handleChange} />
          <textarea name="descricao" value={form.descricao} placeholder="Descrição" onChange={handleChange} />
          <button type="submit" style={buttonStyle}>Salvar</button>
        </form>
      </div>
    </div>
  );
};

const buttonStyle = { padding: "10px 14px", borderRadius: "6px", border: "none", background: "var(--accent, #0d6efd)", color: "white", cursor: "pointer" };

export default EditarProdutoPage;
