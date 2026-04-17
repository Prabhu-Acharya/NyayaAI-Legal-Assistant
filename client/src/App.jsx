import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ContractGenerator from "./pages/ContractGenerator";
import DashboardLayout from "./layouts/DashboardLayout";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={handleLoginSuccess} />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" /> : <Register />}
        />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={token ? <DashboardLayout /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="contracts" element={<ContractGenerator />} />
        </Route>

        {/* Default */}
        <Route
          path="/"
          element={<Navigate to={token ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;