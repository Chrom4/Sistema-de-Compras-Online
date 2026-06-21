import { useEffect, useState } from "react";

const getHasToken = () => Boolean(localStorage.getItem("token"));

export const useIsAuthenticated = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(getHasToken);

  useEffect(() => {
    const syncAuth = () => {
      setIsAuthenticated(getHasToken());
    };

    window.addEventListener("auth-change", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("auth-change", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  return isAuthenticated;
};
