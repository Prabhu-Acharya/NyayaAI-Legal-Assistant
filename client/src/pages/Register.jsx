import React, { useState } from "react";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:5000/api/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    console.log(data);
  };

  return (
    <div>
      <h2>Register</h2>

      <input name="name" placeholder="Name" onChange={handleChange} />
      <br /><br />

      <input name="email" placeholder="Email" onChange={handleChange} />
      <br /><br />

      <input name="password" placeholder="Password" onChange={handleChange} />
      <br /><br />

      <button onClick={handleSubmit}>Register</button>
    </div>
  );
}

export default Register;