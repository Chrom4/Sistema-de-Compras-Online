import { useState } from "react";
import HomeHeader from "../../components/HomeHeader";
import { FaChevronDown, FaEye, FaEyeSlash } from "react-icons/fa";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    telefone: "",
    login: "",
    senha: "",
    perfil: "cliente",
  });

  const [errors, setErrors] = useState({});
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const handleValidationShowMoreOptions = () => {
    const password = prompt("Insira a senha de administração:");

    if (password === "123") {
      return true;
    } else {
      alert("Senha incorreta.");
      return false;
    }
  };

  const handleShowMoreOptionsToggle = () => {
    setShowMoreOptions((prevState) => {
      if (prevState) return false;

      return handleValidationShowMoreOptions();
    });
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "cpf") {
      value = value.replace(/\D/g, "").slice(0, 11);
    }

    if (name === "telefone") {
      value = value.replace(/\D/g, "");
      value = value.slice(0, 11);

      if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d)/, "($1) $2");
      }

      if (value.length > 13) {
        value = value.replace(/(\d{5})(\d{4})$/, "$1-$2");
      } else if (value.length > 9) {
        value = value.replace(/(\d{4})(\d)/, "$1-$2");
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nome.trim()) newErrors.nome = "O nome é obrigatório.";

    if (formData.cpf.length !== 11) {
      newErrors.cpf = "O CPF deve ter exatamente 11 dígitos.";
    }

    if (formData.telefone.length < 10) {
      newErrors.telefone = "Insira um telefone válido com DDD.";
    }

    if (!formData.login.trim()) newErrors.login = "O login é obrigatório.";

    if (formData.senha.length < 6) {
      newErrors.senha = "A senha deve ter no mínimo 6 caracteres.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    fetch("http://localhost:3001/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (response.ok) {
          alert("Registro bem-sucedido! Faça login para continuar.");
          setFormData({
            nome: "",
            cpf: "",
            telefone: "",
            login: "",
            senha: "",
            perfil: "",
          });
          setShowMoreOptions(false);
        } else {
          response.json().then((err) => {
            alert("Erro no registro: " + err.message);
          });
        }
      })
      .catch((error) => {
        console.error("Erro na requisição:", error);
        alert("Erro na requisição: " + error.message);
      });
  };

  return (
    <div className="App">
      <HomeHeader hasBanner={false} />
      <div className="AppContent">
        <div className="AppContentTitle">
          <h1>Registrar</h1>
          <p>Crie sua conta para começar a comprar.</p>
        </div>

        <form className="SubmissionForm" onSubmit={handleSubmit}>
          <label>
            <span>Nome:</span>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
            />
            {errors.nome && (
              <span style={{ color: "red", fontSize: "14px" }}>
                {errors.nome}
              </span>
            )}
          </label>
          <br />

          <label>
            <span>CPF: (Somente números)</span>
            <input
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
            />
            {errors.cpf && (
              <span style={{ color: "red", fontSize: "14px" }}>
                {errors.cpf}
              </span>
            )}
          </label>
          <br />

          <label>
            <span>Telefone:</span>
            <input
              type="text"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(12) 12345-6789"
            />
            {errors.telefone && (
              <span style={{ color: "red", fontSize: "14px" }}>
                {errors.telefone}
              </span>
            )}
          </label>
          <br />

          <div className="Divider" />
          <br />

          <label>
            <span>Login:</span>
            <input
              type="text"
              name="login"
              value={formData.login}
              onChange={handleChange}
            />
            {errors.login && (
              <span style={{ color: "red", fontSize: "14px" }}>
                {errors.login}
              </span>
            )}
          </label>
          <br />

          <label>
            <span>Senha:</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type={showPassword ? "text" : "password"}
                name="senha"
                value={formData.senha}
                onChange={handleChange}
              />
              {showPassword ? (
                <FaEyeSlash
                  onClick={() => setShowPassword(false)}
                  style={{ cursor: "pointer" }}
                />
              ) : (
                <FaEye
                  onClick={() => setShowPassword(true)}
                  style={{ cursor: "pointer" }}
                />
              )}
            </div>

            {errors.senha && (
              <span style={{ color: "red", fontSize: "14px" }}>
                {errors.senha}
              </span>
            )}
          </label>
          <br />

          <div className="Divider" />
          <br />

          {showMoreOptions ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "100%",
              }}
            >
              <span style={{ marginBottom: "8px" }}>Perfil:</span>

              <div style={{ display: "flex", gap: "16px" }}>
                <label
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "8px",
                    width: "auto",
                  }}
                >
                  <input
                    type="radio"
                    name="perfil"
                    value="admin"
                    checked={formData.perfil === "admin"}
                    onChange={handleChange}
                  />
                  Administrador
                </label>

                {/* Opção Atendente */}
                <label
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "8px",
                    width: "auto",
                  }}
                >
                  <input
                    type="radio"
                    name="perfil"
                    value="atendente"
                    checked={formData.perfil === "atendente"}
                    onChange={handleChange}
                  />
                  Atendente
                </label>

                {/* Opção Cliente */}
                <label
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "8px",
                    width: "auto",
                  }}
                >
                  <input
                    type="radio"
                    name="perfil"
                    value="cliente"
                    checked={formData.perfil === "cliente"}
                    onChange={handleChange}
                  />
                  Cliente
                </label>
              </div>

              {/* Mensagem de Erro */}
              {errors.perfil && (
                <span
                  style={{ color: "red", fontSize: "14px", marginTop: "4px" }}
                >
                  {errors.perfil}
                </span>
              )}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
              }}
              onClick={handleShowMoreOptionsToggle}
            >
              Mais opções
              <FaChevronDown />
            </div>
          )}

          <br />

          <button type="submit">Registrar</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
