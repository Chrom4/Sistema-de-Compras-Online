import { Link } from "react-router-dom";
import HomeHeader from "../../components/HomeHeader.jsx";
import ProductPanel from "../../components/ProductPanel.jsx";
import { useIsAuthenticated } from "../../hooks/useIsAuthenticated";
import { useState } from "react";

const HomePage = () => {
  const isAuthenticated = useIsAuthenticated();
  const [searchText, setSearchText] = useState("");
  const [priceOrder, setPriceOrder] = useState("");

  return (
    <div className="App">
      <HomeHeader onSearchTextChange={setSearchText} />
      <div className="AppContent">
        <br/>
        <h2>Bem-vindo ao Online Shopping!</h2>
        {!isAuthenticated && (
          <>
            <p>Faça login ou registre-se para começar a comprar.</p>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "center",
              }}
            >
              <Link to="/login">Login</Link>
              <Link to="/register">Registrar</Link>
            </div>
          </>
        )}

        <ProductPanel priceOrder={priceOrder} searchText={searchText} />
      </div>
    </div>
  );
};

export default HomePage;
