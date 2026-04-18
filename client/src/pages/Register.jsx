import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await API.post("/api/users/register", formData);
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed ❌");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Register</h2>

      <input name="name" placeholder="Name" onChange={handleChange} />
      <br /><br />

      <input name="email" placeholder="Email" onChange={handleChange} />
      <br /><br />

      <input name="password" type="password" placeholder="Password" onChange={handleChange} />
      <br /><br />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>
    </div>
  );
}

export default Register;