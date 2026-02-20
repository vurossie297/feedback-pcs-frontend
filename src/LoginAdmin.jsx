import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginAdmin() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  const login = () => {
    if (user === "admin" && pass === "1234") {
      localStorage.setItem("adminLogin", "true");
      navigate("/dashboard-admin");
    } else {
      alert("Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>🔐 Admin Login</h2>

      <input
        placeholder="Username"
        value={user}
        onChange={e => setUser(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={pass}
        onChange={e => setPass(e.target.value)}
      />
      <br /><br />

      <button onClick={login}>Login</button>
    </div>
  );
}
