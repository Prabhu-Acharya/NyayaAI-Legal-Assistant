// client/src/context/AuthContext.jsx
// ─────────────────────────────────────────────────────────────────────────────
// PATCH NOTES — add/verify these pieces in your existing AuthContext:
//
//  1.  `setUser` must be exported so ProtectedRoute can flip hasAcceptedTerms.
//  2.  When you decode/store the user after login, make sure `hasAcceptedTerms`
//      comes from the server response and is saved here.
//
// Minimal reference implementation (adapt to your existing file):
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount — rehydrate from localStorage token (adjust to your own pattern)
  useEffect(() => {
    const stored = localStorage.getItem("userInfo");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("userInfo");
      }
    }
    setLoading(false);
  }, []);

  // Keep localStorage in sync whenever user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("userInfo", JSON.stringify(user));
    } else {
      localStorage.removeItem("userInfo");
    }
  }, [user]);

  const login = async (email, password) => {
    const { data } = await api.post("/users/login", { email, password });
    // data should include: { _id, name, email, token, hasAcceptedTerms, ... }
    setUser(data);
    return data;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);