import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { owners as defaultOwners } from "./db.js"; // owner cứng
import { loadOwners } from "./storage.js"; // load owner từ localStorage

export default function LoginOwner() {
  const [ownerId, setOwnerId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    // Lấy owner từ localStorage (nếu có)
    const storedOwners = loadOwners(); // trả về mảng owner {id, password}
    const allOwners = [...defaultOwners, ...storedOwners];

    const o = allOwners.find(
      o => o.id === ownerId && o.password === password
    );

    if (!o) {
      alert("ID hoặc mật khẩu không đúng");
      return;
    }

    // Nếu login thành công, dẫn tới dashboard owner
    navigate(`/dashboard-owner/${o.id}`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login Owner</h2>
      <div style={{ marginBottom: 10 }}>
        <input
          placeholder="Owner ID"
          value={ownerId}
          onChange={e => setOwnerId(e.target.value)}
          style={{ marginRight: 5 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      <button onClick={handleLogin}>Login</button>

      <div style={{ marginTop: 20 }}>
        <a href="/login-admin">Login Admin</a>
      </div>
    </div>
  );
}
