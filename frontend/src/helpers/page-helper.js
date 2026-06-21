import { useMemo } from "react";

export const getTokenPayload = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const cleanToken = token.replace(/"/g, "");
    const payload = JSON.parse(atob(cleanToken.split(".")[1]));

    return payload;
  } catch (err) {
    console.error("Erro ao decodificar token:", err);
    return null;
  }
};

export const getCodigoCliente = () => getTokenPayload()?.codigo_cliente;

export const getPerfilCliente = () => getTokenPayload()?.perfil;
