import { useState } from "react";
import HomeHeader from "../../components/HomeHeader";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // 1. Estado para controlar os inputs
  const [formData, setFormData] = useState({
    login: "",
    senha: "",
  });

  // 2. Estado para mensagens de erro
  const [errors, setErrors] = useState({});

  // 3. Função que atualiza o estado em tempo real
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpa o erro assim que o usuário volta a digitar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // 4. Validação simples antes de enviar
  const validate = () => {
    const newErrors = {};

    if (!formData.login.trim())
      newErrors.login = "Por favor, insira seu login.";
    if (!formData.senha.trim())
      newErrors.senha = "Por favor, insira sua senha.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (response.ok) {
          response.json().then((res) => {
            if (res.success) {
              alert(`Login bem-sucedido! Bem-vindo, ${formData.login}!`);
              const user = res.token;
              localStorage.setItem("token", JSON.stringify(user));
              window.dispatchEvent(new Event("auth-change"));
              navigate("/");
            } else {
              alert("Erro no login: " + res.message);
            }
          });
        } else {
          response.json().then((err) => {
            alert("Erro no login: " + err.message);
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
          <h1>Login</h1>
        </div>
        <form className="SubmissionForm" onSubmit={handleSubmit}>
          <label>
            <span>Login:</span>
            <input
              type="text"
              name="login"
              value={formData.login}
              onChange={handleChange}
            />
            {errors.login && (
              <span
                style={{ color: "red", fontSize: "14px", display: "block" }}
              >
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
                <FaEyeSlash onClick={() => setShowPassword(false)} style={{ cursor: "pointer" }} />
              ) : (
                <FaEye onClick={() => setShowPassword(true)} style={{ cursor: "pointer" }} />
              )}
            </div>
            {errors.senha && (
              <span
                style={{ color: "red", fontSize: "14px", display: "block" }}
              >
                {errors.senha}
              </span>
            )}
          </label>
          <br />
          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
