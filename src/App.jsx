import { useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Feedback from "./Feedback";
import DashboardAdmin from "./DashboardAdmin";
import { upgradeRequests, serviceStatus } from "./db";


<Route path="/dashboard-admin" element={<DashboardAdmin />} />

export default function App() {
  const [role, setRole] = useState(null);       // "admin" | "owner" | null
  const [ownerId, setOwnerId] = useState(null); // id owner đăng nhập
  const [ownersState, setOwnersState] = useState([
    { id: 1, name: "KS ABC", email: "abc@ks.com", serviceActive: true, featureActive: false },
    { id: 2, name: "KS XYZ", email: "xyz@ks.com", serviceActive: true, featureActive: true }
  ]);

  const [feedbackData, setFeedbackData] = useState([]);

  const handleLogin = (role, ownerId) => {
    setRole(role);
    setOwnerId(ownerId);
  };

  // Nếu quét QR link feedback (ownerId query param)

  const urlParams = new URLSearchParams(window.location.search);
  const qrOwnerId = urlParams.get("ownerId");

  if (qrOwnerId) {
    return <Feedback ownerId={Number(qrOwnerId)} feedbackData={feedbackData} setFeedbackData={setFeedbackData} />;
  }

  if (!role) {
    return <Login owners={ownersState} onLogin={handleLogin} />;
  }

  return (
    <Dashboard
      role={role}
      ownerId={ownerId}
      ownersState={ownersState}
      setOwnersState={setOwnersState}
      feedbackData={feedbackData}
    />
  );
}
