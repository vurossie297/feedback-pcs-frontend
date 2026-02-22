// DashboardOwner.jsx
import React, { useState, useEffect } from "react";
import "./DashboardOwner.css";

export default function DashboardOwner({ ownerId }) {
  const [business, setBusiness] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState({ rating: 0, comment: "" });
  const [logoFile, setLogoFile] = useState(null);
  const [bgFile, setBgFile] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const API_BASE = "https://feedback-pcs-api.vurossie297.workers.dev";

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/business/${ownerId}`);
        setBusiness(await res.json());
        const fbRes = await fetch(`${API_BASE}/api/feedback/${ownerId}`);
        setFeedbacks(await fbRes.json());
      } catch (err) { console.error(err); }
    };
    fetchBusiness();
  }, [ownerId]);

  const handleSubmitFeedback = async () => {
    if (!newFeedback.rating) return alert("Vui lòng chọn rating");
    try {
      const res = await fetch(`${API_BASE}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: ownerId, rating: newFeedback.rating, comment: newFeedback.comment }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Gửi feedback thất bại");
      setFeedbacks(prev => [{ ...newFeedback, created_at: new Date().toISOString() }, ...prev]);
      setNewFeedback({ rating: 0, comment: "" });
      showSuccess("✅ Gửi feedback thành công");
    } catch (err) { console.error(err); }
  };

  const showSuccess = (msg) => { setSuccessMessage(msg); setShowSuccessModal(true); };

  if (!business) return <p>Đang tải...</p>;

  return (
    <div className="dashboard-owner-container">
      <h2>Dashboard Owner: {business.name}</h2>
      <div>
        <label>Rating:</label>
        <input type="number" min={0} max={5} value={newFeedback.rating} onChange={e => setNewFeedback(prev => ({ ...prev, rating: Number(e.target.value) }))} />
        <textarea value={newFeedback.comment} onChange={e => setNewFeedback(prev => ({ ...prev, comment: e.target.value }))}></textarea>
        <button onClick={handleSubmitFeedback}>Gửi Feedback</button>
      </div>

      <h3>Feedback đã nhận</h3>
      <table className="table-hover">
        <thead><tr><th>Rating</th><th>Comment</th><th>Ngày</th></tr></thead>
        <tbody>
          {feedbacks.map((f, idx) => (
            <tr key={idx}><td>{f.rating}</td><td>{f.comment}</td><td>{new Date(f.created_at).toLocaleString()}</td></tr>
          ))}
        </tbody>
      </table>

      {showSuccessModal && <div className="modal-overlay"><div className="modal">
        <p>{successMessage}</p>
        <button onClick={() => setShowSuccessModal(false)}>OK</button>
      </div></div>}
    </div>
  );
}