import React, { useState } from "react";
import API from "../services/api";

function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await API.post("/api/users/login", formData);

      if (!data.token) {
        setError(data.message || "Login failed ❌");
        setLoading(false);
        return;
      }

      onLoginSuccess(data.token);

    } catch (err) {
      setError(err.response?.data?.message || "Login failed ❌");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Login Page</h2>

      <input
        name="email"
        placeholder="Enter Email"
        onChange={handleChange}
      />
      <br /><br />

      <input
        name="password"
        type="password"
        placeholder="Enter Password"
        onChange={handleChange}
      />
      <br /><br />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}

export default Login;