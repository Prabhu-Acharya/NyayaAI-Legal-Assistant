import React from "react";

function Dashboard() {

  const handleLogout = () => {
    // 🔐 token remove
    localStorage.removeItem("token");

    // 🔄 reload page
    window.location.reload();
  };

  return (
    <div>
      <h2>Welcome to NyayaAI Dashboard ⚖️</h2>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;