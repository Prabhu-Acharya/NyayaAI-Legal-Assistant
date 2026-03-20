import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {

  // 🔍 check token (user logged in hai ya nahi)
  const token = localStorage.getItem("token");

  return (
    <div>
      <h1>NyayaAI ⚖️</h1>

      {
        token ? (
          // ✅ agar token hai → dashboard dikhao
          <Dashboard />
        ) : (
          // ❌ agar token nahi hai → login + register dikhao
          <>
            <Register />
            <Login />
          </>
        )
      }

    </div>
  );
}

export default App;