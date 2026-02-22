import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { loadRequests, saveRequests, loadStatus } from "./storage";
import "./DashboardOwner.css";

export default function DashboardOwner() {
  const { ownerId } = useParams();

  const [modalOpen, setModalOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [feedbacks, setFeedbacks] = useState([]);

  const statusList = loadStatus();
  const status =
    statusList.find((s) => s.ownerId === ownerId) || {
      serviceActive: false,
      packageActive: false,
    };

  // ================================
  // FETCH FEEDBACK FROM WORKER
  // ================================
  useEffect(() => {
    fetch(
      `https://feedback-pcs-api.vurossie297.workers.dev/api/feedback/${ownerId}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFeedbacks(data);
        } else {
          setFeedbacks([]);
        }
      })
      .catch((err) => console.error("Fetch feedback error:", err));
  }, [ownerId]);

  const sendUpgradeRequest = () => {
    const requests = loadRequests();
    const existed = requests.find(
      (r) => r.ownerId === ownerId && r.status === "pending"
    );

    if (existed) {
      setModalMessage("⏳ Bạn đã gửi yêu cầu, vui lòng chờ Admin xử lý");
      setModalOpen(true);
      return;
    }

    const newReq = {
      ownerId,
      type: status.serviceActive ? "upgrade" : "renew",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const updated = [...requests, newReq];
    saveRequests(updated);

    setRequestSent(true);
    setModalMessage("✅ Yêu cầu đã được gửi. Admin sẽ liên hệ bạn.");
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  // ================================
  // CHƯA ACTIVE
  // ================================
  if (!status.serviceActive) {
    const rejectedRequests = Object.values(
      loadRequests()
        .filter((r) => r.ownerId === ownerId && r.status === "rejected")
        .reduce((acc, r) => {
          acc[r.type] = r;
          return acc;
        }, {})
    );

    return (
      <div className="owner-container">
        <h3 className="center-text">🚫 Dịch vụ chưa sẵn sàng</h3>
        <p>
          Dịch vụ của bạn chưa được <b>KÍCH HOẠT</b> hoặc đã <b>HẾT HẠN</b>.
        </p>

        <button className="send-service-btn" onClick={sendUpgradeRequest}>
          🚀 Gửi yêu cầu
        </button>

        {rejectedRequests.map((r, idx) => (
          <div key={idx} className="rejected-request">
            ❌ Yêu cầu bị từ chối:{" "}
            <span className="rejected-note">{r.note}</span>
          </div>
        ))}

        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Thông báo</h3>
              <p>{modalMessage}</p>
              <div className="modal-actions confirm-modal">
                <button className="primary-btn" onClick={closeModal}>
                  OK
                </button>
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

  const [filter, setFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { filtered, goodCount, badCount } = useMemo(() => {
    let good = 0;
    let bad = 0;

    const f = feedbacks.filter((fb) => {
      const type = fb.rating >= 4 ? "good" : "bad";

      if (filter === "good" && type !== "good") return false;
      if (filter === "bad" && type !== "bad") return false;

      const d = new Date(fb.created_at);

      if (fromDate && d < new Date(fromDate + "T00:00:00")) return false;
      if (toDate && d > new Date(toDate + "T23:59:59")) return false;

      if (type === "good") good++;
      if (type === "bad") bad++;

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
        <button className="primary-btn" onClick={() => setFilter("all")}>
          Tất cả
        </button>
        <button className="primary-btn" onClick={() => setFilter("good")}>
          👍 Tốt
        </button>
        <button className="primary-btn" onClick={() => setFilter("bad")}>
          👎 Xấu
        </button>
        <button
          className="secondary-btn clear-btn"
          onClick={() => {
            setFromDate("");
            setToDate("");
          }}
        >
          Clear dates
        </button>
      </div>

      <div className="date-container">
        <span>Từ:</span>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="date-filter"
        />
        <span>Đến:</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="date-filter"
        />
      </div>

      <div className="stats-box">
        <div>
          <b>Tổng đánh giá:</b> {total}
        </div>
        <div>👍 Đánh giá tốt: {goodCount}</div>
        <div>👎 Đánh giá xấu: {badCount}</div>
        <div>
          <b>Tỷ lệ hài lòng:</b> {satisfaction}%
        </div>
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
                <td>{f.rating >= 4 ? "👍" : "👎"}</td>
                <td>{"⭐".repeat(f.rating)}</td>
                <td>
                  {f.rating < 4 && !canViewDetail
                    ? "🔒 Nâng cấp gói để xem chi tiết"
                    : f.comment}
                </td>
                <td>{dateObj.toLocaleDateString()}</td>
                <td>{dateObj.toLocaleTimeString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}