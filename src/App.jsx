import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Home from "./Components/Home";
import Sidebar from "./common/Sidebar";
import Account from "./Components/Account";
import Portfolios from "./Components/Portfolios";
import GiftSubscription from "./Components/GiftSubscription";
import Experimental from "./Components/Experimental";
import StockArchives from "./Components/StockArchives";
import ReferAFriend from "./Components/ReferAFriend";

function App() {
  const navigate = useNavigate();

  const handleMenuSelect = (path, label) => {
    navigate(path);
  };

  return (
    <Sidebar onMenuSelect={handleMenuSelect}>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/home" element={<Home />} />
        <Route exact path="/portfolios" element={<Portfolios />} />
        <Route exact path="/experimental" element={<Experimental />} />
        <Route exact path="/stack" element={<StockArchives />} />
        <Route exact path="/refer" element={<ReferAFriend />} />
        <Route exact path="/gift" element={<GiftSubscription />} />
        <Route exact path="/account" element={<Account />} />
      </Routes>
    </Sidebar>
  );
}

export default App;
