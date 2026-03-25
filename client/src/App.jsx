import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/ChatPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <h1 className="text-center text-2xl">NyayaAI ⚖️</h1>

      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" /> : <Login />}
        />

        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" /> : <Register />}
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />

        <Route
          path="/chat"
          element={token ? <ChatPage /> : <Navigate to="/login" />}
        />

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