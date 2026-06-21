import { Fragment, useEffect, useState } from "react";
import {
  FaUser,
  FaShoppingCart,
  FaBox,
  FaUserTie,
  FaMap,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { useIsAuthenticated } from "../hooks/useIsAuthenticated";
import { getCodigoCliente, getTokenPayload } from "../helpers/page-helper";

const HomeHeader = ({ hasBanner = true, onSearchTextChange }) => {
  const [cartItems, setCartItems] = useState(null);
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const tokenPayload = getTokenPayload();

  const codigoCliente = tokenPayload?.codigo_cliente;
  const isAdmin = tokenPayload?.perfil === "admin";
  const isAtendente = tokenPayload?.perfil === "atendente";

  let iconTitle = "Carrinho";
  let iconNavPath = "/carrinho";

  if (isAdmin) {
    iconTitle = "Admin";
    iconNavPath = "/admin";
  }

  if (isAtendente) {
    iconTitle = "Admin";
    iconNavPath = "/atendente";
  }

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await fetch(
          "http://localhost:3001/carrinhos/cliente/" + codigoCliente,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token").replaceAll('"', "")}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setCartItems(data.items);
        } else {
          throw new Error(
            "Erro ao buscar itens do carrinho: " + response.statusText,
          );
        }
      } catch (error) {
        console.error("Erro na requisição:", error);
      }
    };

    fetchCartItems();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-change"));
    navigate("/");
  };

  const actions = isAuthenticated
    ? [
        {
          title: "Sair",
          onClick: handleLogout,
        },
      ]
    : [
        {
          title: "Login",
          onClick: () => {
            navigate("/login");
          },
        },
        {
          title: "Registrar",
          onClick: () => {
            navigate("/register");
          },
        },
      ];

  return (
    <div className="HomeHeaderContainer">
      <div className="HomeHeader">
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            navigate("/");
          }}
        >
          Online Shopping
        </span>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          {isAuthenticated && (
            <span>
              {
                JSON.parse(atob(localStorage.getItem("token").split(".")[1]))
                  .login
              }
            </span>
          )}
          <FaUser />
          {actions.map((action, index) => (
            <Fragment key={`${action.title}-${index}`}>
              <span
                style={{
                  cursor: "pointer",
                  color: "var(--accent)",
                  fontWeight: 700,
                }}
                onClick={action.onClick}
              >
                {action.title}
              </span>
              {index !== actions.length - 1 && <span>|</span>}
            </Fragment>
          ))}
        </div>
      </div>
      {hasBanner && (
        <div className="HomeHeaderBanner">
          {!!onSearchTextChange && (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <p>Buscar:</p>
              <input
                onChange={(e) => onSearchTextChange(e.target.value)}
                type="text"
                placeholder="Digite..."
              />
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "22px",
              alignItems: "center",
              marginLeft: "auto",
            }}
          >
            {isAdmin || isAtendente ? (
              <div style={{ position: "relative" }}>
                <FaUserTie
                  title={iconTitle}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(iconNavPath)}
                  size={22}
                />
              </div>
            ) : (
              [
                <div style={{ position: "relative" }}>
                  <FaMap
                    title={"Endereços"}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/enderecos")}
                    size={22}
                  />
                </div>,
                <div style={{ position: "relative" }}>
                  <FaBox
                    title="Meus pedidos"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/pedidos")}
                    size={22}
                  />
                </div>,
                <div style={{ position: "relative" }}>
                  <FaShoppingCart
                    title={iconTitle}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(iconNavPath)}
                    size={22}
                  />
                  {cartItems?.length ? (
                    <div
                      style={{
                        position: "absolute",
                        fontSize: 10,
                        borderRadius: 99,
                        top: -10,
                        right: -10,
                        height: 14,
                        width: 14,
                        background: "red",

                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",

                        color: "white",
                      }}
                    >
                      {cartItems.length}
                    </div>
                  ) : null}
                </div>,
              ]
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeHeader;
