// client/src/components/ProtectedRoute.jsx
//
// Wraps any route that requires:
//   (a) authentication, AND
//   (b) accepted terms
//
// Usage in App.jsx / router:
//   <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // adjust to your actual auth context path
import TermsModal from "./TermsModal";

export default function ProtectedRoute({ children }) {
  const { user, setUser, loading } = useAuth();

  // Still loading user from localStorage / token validation → show nothing
  if (loading) return null;

  // Not logged in → redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but hasn't accepted terms → show modal (blocks the page behind it)
  if (!user.hasAcceptedTerms) {
    return (
      <>
        {/* Render the protected page behind the modal (blurred/locked) */}
        <div style={{ filter: "blur(4px)", pointerEvents: "none", userSelect: "none" }}>
          {children}
        </div>

        {/* Modal sits on top */}
        <TermsModal
          onAccepted={() =>
            setUser((prev) => ({ ...prev, hasAcceptedTerms: true }))
          }
        />
      </>
    );
  }

  // All good — render the protected page
  return children;
}