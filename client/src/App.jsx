import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ContractGenerator from "./pages/ContractGenerator";
import DashboardLayout from "./layouts/DashboardLayout"; // ← NEW
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      {/* ← REMOVE the global <h1> — sidebar owns the brand now */}

      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" /> : <Register />}
        />

        {/* Protected — shared layout wraps both pages */}
        <Route
          path="/dashboard"
          element={token ? <DashboardLayout /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="contracts" element={<ContractGenerator />} />
        </Route>

        {/* ← REMOVE the old flat /contracts route */}

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