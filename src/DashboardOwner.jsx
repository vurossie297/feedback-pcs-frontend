//DashboardOwner.jsx
import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { feedbacks } from "./db";
import { loadRequests, saveRequests, loadStatus } from "./storage";
import "./DashboardOwner.css";

export default function DashboardOwner() {
  const { ownerId } = useParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const statusList = loadStatus();
  const status = statusList.find(s => s.ownerId === ownerId) || { serviceActive: false, packageActive: false };

  const sendUpgradeRequest = () => {
    const requests = loadRequests();
    const existed = requests.find(r => r.ownerId === ownerId && r.status === "pending");

    if (existed) {
      setModalMessage("⏳ Bạn đã gửi yêu cầu, vui lòng chờ Admin xử lý");
      setModalOpen(true);
      return;
    }

    const newReq = { ownerId, type: status.serviceActive ? "upgrade" : "renew", status: "pending", createdAt: new Date().toISOString() };
    const updated = [...requests, newReq];
    saveRequests(updated);
    setRequestSent(true);
    setModalMessage("✅ Yêu cầu đã được gửi. Admin sẽ liên hệ bạn.");
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  if (!status.serviceActive) {
    // Hiển thị khi dịch vụ chưa active
    const rejectedRequests = Object.values(
      loadRequests()
        .filter(r => r.ownerId === ownerId && r.status === "rejected")
        .reduce((acc, r) => {
          acc[r.type] = r; // giữ mỗi loại request 1 lần
          return acc;
        }, {})
    );

    return (
      <div className="owner-container">
        <h3 className="center-text">🚫 Dịch vụ chưa sẵn sàng</h3>
        <p>Dịch vụ của bạn đã chưa được <b>KÍCH HOẠT</b> hoặc đã <b>HẾT HẠN</b>. Vui lòng gửi yêu cầu để Admin xử lý!</p>
        <button className="send-service-btn" onClick={sendUpgradeRequest}>🚀 Gửi yêu cầu</button>

        {rejectedRequests.map((r, idx) => (
          <div key={idx} className="rejected-request">
            ❌ Yêu cầu bị từ chối: <span className="rejected-note">{r.note}</span>
          </div>
        ))}

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

  // Khi dịch vụ active
  const canViewDetail = status.packageActive;
  const [filter, setFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { filtered, goodCount, badCount } = useMemo(() => {
    let good=0, bad=0;
    const f = feedbacks.filter(fb => {
      if(fb.ownerId !== ownerId) return false;
      if(filter==="good" && fb.type!=="good") return false;
      if(filter==="bad" && fb.type!=="bad") return false;
      const d = new Date(fb.date+"T"+(fb.time||"00:00"));
      if(fromDate && d<new Date(fromDate+"T00:00:00")) return false;
      if(toDate && d>new Date(toDate+"T23:59:59")) return false;
      if(fb.type==="good") good++; 
      if(fb.type==="bad") bad++;
      return true;
    });
    return { filtered: f, goodCount: good, badCount: bad };
  }, [filter, fromDate, toDate, ownerId]);

  const total = filtered.length;
  const satisfaction = total ? Math.round((goodCount/total)*100) : 0;

  return (
    <div className="owner-container">
      <h2 className="center-text">Partner Control System</h2>
      <h2 className="owner-id-text">{ownerId}</h2>

      <div className="filter-buttons">
        <button className="primary-btn" onClick={()=>setFilter("all")}>Tất cả</button>
        <button className="primary-btn" onClick={()=>setFilter("good")}>👍 Tốt</button>
        <button className="primary-btn" onClick={()=>setFilter("bad")}>👎 Xấu</button>
        <button className="secondary-btn clear-btn" onClick={()=>{setFromDate(""); setToDate("");}}>Clear dates</button>
      </div>
      
      <div className="date-container">
        <span>Từ:</span>
        <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} className="date-filter"/>
        <span>Đến:</span>
        <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} className="date-filter"/>
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
            <th>User</th><th>Loại</th><th>Sao</th><th>Email</th><th>Nội dung</th><th>Ngày</th><th>Giờ</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((f, idx)=>(
            <tr key={idx}>
              <td>{f.user}</td>
              <td>{f.type==="good"?"👍":"👎"}</td>
              <td>{f.stars ? "⭐".repeat(f.stars) : "—"}</td>
              <td>{f.type==="bad" && !canViewDetail ? "🔒" : f.email}</td>
              <td>{f.type==="bad" && !canViewDetail ? "🔒 Nâng cấp gói để xem chi tiết" : f.content}</td>
              <td>{f.date}</td>
              <td>{f.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}