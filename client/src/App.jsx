import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ContractGenerator from "./pages/ContractGenerator";
import DashboardLayout from "./layouts/DashboardLayout";
import TermsModal from "./components/TermsModal";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";

// OUTSIDE App — stable identity, no remount on state change
function ProtectedDashboard({ token, hasAcceptedTerms, onTermsAccepted, onLogout }) {
  if (!token) return <Navigate to="/login" />;
  return (
    <>
      {!hasAcceptedTerms && (
        <>
          <div style={{ filter: "blur(4px)", pointerEvents: "none", userSelect: "none" }}>
            <DashboardLayout onLogout={onLogout} />
          </div>
          <TermsModal onAccepted={onTermsAccepted} />
        </>
      )}
      {hasAcceptedTerms && <DashboardLayout onLogout={onLogout} />}
    </>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(
    () => localStorage.getItem("hasAcceptedTerms") === "true"
  );

  const handleLoginSuccess = (newToken, acceptedTerms = false) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("hasAcceptedTerms", String(acceptedTerms));
    setToken(newToken);
    setHasAcceptedTerms(acceptedTerms);
  };

  const handleTermsAccepted = () => {
    localStorage.setItem("hasAcceptedTerms", "true");
    setHasAcceptedTerms(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("hasAcceptedTerms");
    setToken(null);
    setHasAcceptedTerms(false);
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={token ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="/register"
            element={token ? <Navigate to="/dashboard" /> : <Register />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedDashboard
                token={token}
                hasAcceptedTerms={hasAcceptedTerms}
                onTermsAccepted={handleTermsAccepted}
                onLogout={handleLogout}
              />
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="contracts" element={<ContractGenerator />} />
          </Route>
          <Route
            path="/"
            element={<Navigate to={token ? "/dashboard" : "/register"} />}
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;