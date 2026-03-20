import React, { useState } from "react";

function Login() {
  // 🧠 form data store
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  // 📝 input handle
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 🔐 login function
  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      console.log(data);

      // ❌ error handle (IMPORTANT)
      if (!data.token) {
        alert(data.message || "Login failed ❌");
        return;
      }

      // 💾 token save
      localStorage.setItem("token", data.token);

      alert("Login Successful 🚀");

      // 🔄 reload → dashboard show hoga
      window.location.reload();

    } catch (error) {
      console.error(error);
    }
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

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;