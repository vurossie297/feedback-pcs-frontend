// DashboardOwner.jsx
import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./DashboardOwner.css";

export default function DashboardOwner() {
  const { ownerId } = useParams();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  const [feedbacks, setFeedbacks] = useState([]);
  const [upgradeRequests, setUpgradeRequests] = useState([]);
  const [status, setStatus] = useState({ serviceActive: false, packageActive: false });

  const [filter, setFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ================================
  // FETCH STATUS & FEEDBACKS & UPGRADE REQUESTS
  // ================================
  useEffect(() => {
    // Lấy status owner
    fetch(`https://feedback-pcs-api.vurossie297.workers.dev/api/business/${ownerId}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setStatus({
            serviceActive: data.serviceActive ?? false,
            packageActive: data.packageActive ?? false,
            name: data.name ?? "",
            type: data.type ?? "restaurant",
          });
        }
      })
      .catch(err => console.error("Fetch status error:", err));

    // Lấy feedbacks
    fetch(`https://feedback-pcs-api.vurossie297.workers.dev/api/feedback/${ownerId}`)
      .then(res => res.json())
      .then(data => setFeedbacks(Array.isArray(data) ? data : []))
      .catch(err => console.error("Fetch feedback error:", err));

    // Lấy upgrade requests
    fetch(`https://feedback-pcs-api.vurossie297.workers.dev/api/upgrade-request/${ownerId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUpgradeRequests(data);
      })
      .catch(err => console.error("Fetch upgrade requests error:", err));
  }, [ownerId]);

  // ================================
  // SEND UPGRADE REQUEST
  // ================================
  const sendUpgradeRequest = async () => {
    if (requestSent) {
      setModalMessage("⏳ Bạn đã gửi yêu cầu, vui lòng chờ Admin xử lý");
      setModalOpen(true);
      return;
    }

    try {
      const res = await fetch("https://feedback-pcs-api.vurossie297.workers.dev/api/upgrade-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: ownerId,
          name: status.name,
          type: status.type,
          status: "pending",
          createdAt: new Date().toISOString()
        }),
      });

      if (res.ok) {
        setRequestSent(true);
        setModalMessage("✅ Yêu cầu đã được gửi. Admin sẽ liên hệ bạn.");

        // Cập nhật danh sách yêu cầu ngay
        setUpgradeRequests(prev => [
          ...prev,
          { business_slug: ownerId, name: status.name, type: status.type, status: "pending", created_at: new Date().toISOString() }
        ]);
      } else {
        const err = await res.json();
        setModalMessage(`❌ Lỗi: ${err?.error || "Không gửi được yêu cầu"}`);
      }
    } catch (err) {
      setModalMessage(`❌ Lỗi: ${err.message}`);
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  // ================================
  // CHƯA ACTIVE
  // ================================
  if (!status.serviceActive) {
    return (
      <div className="owner-container">
        <h3 className="center-text">🚫 Dịch vụ chưa sẵn sàng</h3>
        <p>
          Dịch vụ của bạn chưa được <b>KÍCH HOẠT</b> hoặc đã <b>HẾT HẠN</b>.
        </p>

        <button className="send-service-btn" onClick={sendUpgradeRequest}>
          🚀 Gửi yêu cầu
        </button>

        {upgradeRequests.length > 0 && (
          <div className="upgrade-list">
            <h4>📄 Yêu cầu đã gửi:</h4>
            <ul>
              {upgradeRequests.map((r, idx) => (
                <li key={idx}>
                  {new Date(r.created_at).toLocaleString()} – <b>{r.status}</b>
                </li>
              ))}
            </ul>
          </div>
        )}

        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Thông báo</h3>
              <p>{modalMessage}</p>
              <div className="modal-actions confirm-modal">
                <button className="primary-btn" onClick={closeModal}>OK</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================================
  // SERVICE ACTIVE
  // ================================
  const canViewDetail = status.packageActive;

  const { filtered, goodCount, badCount } = useMemo(() => {
    let good = 0, bad = 0;

    const f = feedbacks.filter(fb => {
      const type = fb.rating >= 4 ? "good" : "bad";

      if (filter === "good" && type !== "good") return false;
      if (filter === "bad" && type !== "bad") return false;

      const d = new Date(fb.created_at);
      if (fromDate && d < new Date(fromDate + "T00:00:00")) return false;
      if (toDate && d > new Date(toDate + "T23:59:59")) return false;

      type === "good" ? good++ : bad++;

      return true;
    });

    return { filtered: f, goodCount: good, badCount: bad };
  }, [feedbacks, filter, fromDate, toDate]);

  const total = filtered.length;
  const satisfaction = total ? Math.round((goodCount / total) * 100) : 0;

  return (
    <div className="owner-container">
      <h2 className="center-text">Partner Control System</h2>
      <h2 className="owner-id-text">{ownerId}</h2>

      <div className="filter-buttons">
        <button className="primary-btn" onClick={() => setFilter("all")}>Tất cả</button>
        <button className="primary-btn" onClick={() => setFilter("good")}>👍 Tốt</button>
        <button className="primary-btn" onClick={() => setFilter("bad")}>👎 Xấu</button>
        <button className="secondary-btn clear-btn" onClick={() => { setFromDate(""); setToDate(""); }}>Clear dates</button>
      </div>

      <div className="date-container">
        <span>Từ:</span>
        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="date-filter"/>
        <span>Đến:</span>
        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="date-filter"/>
      </div>

      <div className="stats-box">
        <div><b>Tổng đánh giá:</b> {total}</div>
        <div>👍 Đánh giá tốt: {goodCount}</div>
        <div>👎 Đánh giá xấu: {badCount}</div>
        <div><b>Tỷ lệ hài lòng:</b> {satisfaction}%</div>
      </div>

      <table className="table-hover">
        <thead>
          <tr>
            <th>Loại</th>
            <th>Sao</th>
            <th>Nội dung</th>
            <th>Ngày</th>
            <th>Giờ</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((f, idx) => {
            const dateObj = new Date(f.created_at);
            return (
              <tr key={idx}>
                <td>{f.rating >= 1 ? "👍" : "👎"}</td>
                <td>{"🔒".repeat(f.rating)}</td>
                <td>{f.rating < 1 && !canViewDetail ? "🔒 Nâng cấp gói để xem chi tiết" : f.comment}</td>
                <td>{dateObj.toLocaleDateString()}</td>
                <td>{dateObj.toLocaleTimeString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {upgradeRequests.length > 0 && (
        <div className="upgrade-list">
          <h4>📄 Yêu cầu nâng cấp đã gửi:</h4>
          <ul>
            {upgradeRequests.map((r, idx) => (
              <li key={idx}>
                {new Date(r.created_at).toLocaleString()} – <b>{r.status}</b>
              </li>
            ))}
          </ul>
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Thông báo</h3>
            <p>{modalMessage}</p>
            <div className="modal-actions confirm-modal">
              <button className="primary-btn" onClick={closeModal}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}