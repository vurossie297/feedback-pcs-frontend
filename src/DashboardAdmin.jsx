// DashboardAdmin.jsx
import React, { useState, useEffect } from "react";
import "./DashboardAdmin.css";

export default function DashboardAdmin() {
  const [ownerList, setOwnerList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [requests, setRequests] = useState([]);
  const [editingOwnerId, setEditingOwnerId] = useState(null);
  const [serviceEditing, setServiceEditing] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [bgFile, setBgFile] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOwner, setNewOwner] = useState({ slug: "", name: "", type: "restaurant", login_id: "", password: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [ownerToReject, setOwnerToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const API_BASE = "https://feedback-pcs-api.vurossie297.workers.dev";

  // ================================
  // LOAD OWNERS + STATUS + REQUESTS
  // ================================
  const fetchOwners = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/business/all`);
      const data = await res.json();
      setOwnerList(data);
      // Status
      const statusRes = await fetch(`${API_BASE}/api/status/all`);
      const statusData = await statusRes.json();
      setStatusList(statusData);
      // Requests
      const reqRes = await fetch(`${API_BASE}/api/requests/all`);
      const reqData = await reqRes.json();
      setRequests(reqData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  // ================================
  // CREATE OWNER
  // ================================
  const handleCreateOwner = async () => {
    const { slug, name, type, login_id, password } = newOwner;
    if (!slug || !name || !login_id || !password) return alert("Điền đủ thông tin");
    try {
      const res = await fetch(`${API_BASE}/api/create-owner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name, type, login_id, password }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Tạo owner thất bại");
      setShowCreateModal(false);
      showSuccess(`✅ Tạo Owner thành công: ${login_id}`);
      fetchOwners();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo owner");
    }
  };

  // ================================
  // DELETE OWNER
  // ================================
  const handleDeleteOwner = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/business/${ownerToDelete}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Xoá thất bại");
      showSuccess(`✅ Xoá Owner: ${ownerToDelete}`);
      setShowDeleteModal(false);
      fetchOwners();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xoá owner");
    }
  };

  // ================================
  // APPROVE / REJECT REQUEST
  // ================================
  const handleApprove = async (req) => {
    try {
      const res = await fetch(`${API_BASE}/api/requests/${req.ownerId}/approve`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Approve thất bại");
      showSuccess(`✅ Đã duyệt dịch vụ cho ${req.ownerId}`);
      fetchOwners();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi duyệt request");
    }
  };

  const handleReject = async () => {
    if (!rejectReason) return alert("Nhập lý do từ chối");
    try {
      const res = await fetch(`${API_BASE}/api/requests/${ownerToReject}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Reject thất bại");
      showSuccess(`❌ Đã từ chối ${ownerToReject}`);
      setShowRejectModal(false);
      fetchOwners();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi từ chối request");
    }
  };

  // ================================
  // TOGGLE SERVICE / PACKAGE
  // ================================
  const toggleService = async (ownerId) => {
    try {
      await fetch(`${API_BASE}/api/status/${ownerId}/toggle-service`, { method: "POST" });
      fetchOwners();
    } catch (err) {
      console.error(err);
    }
  };

  const togglePackage = async (ownerId) => {
    try {
      await fetch(`${API_BASE}/api/status/${ownerId}/toggle-package`, { method: "POST" });
      fetchOwners();
    } catch (err) {
      console.error(err);
    }
  };

  // ================================
  // SUCCESS MODAL
  // ================================
  const showSuccess = (msg) => { setSuccessMessage(msg); setShowSuccessModal(true); };

  return (
    <div className="dashboard-container">
      <h2>PCS ADMIN</h2>
      <button onClick={() => setShowCreateModal(true)}>➕ Tạo Owner mới</button>

      {/* MODAL CREATE */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Tạo Owner mới</h3>
            <input placeholder="Slug" value={newOwner.slug} onChange={e => setNewOwner(prev => ({ ...prev, slug: e.target.value }))} />
            <input placeholder="Tên" value={newOwner.name} onChange={e => setNewOwner(prev => ({ ...prev, name: e.target.value }))} />
            <select value={newOwner.type} onChange={e => setNewOwner(prev => ({ ...prev, type: e.target.value }))}>
              <option value="restaurant">Restaurant</option>
              <option value="hotel">Hotel</option>
              <option value="other">Other</option>
            </select>
            <input placeholder="Login ID" value={newOwner.login_id} onChange={e => setNewOwner(prev => ({ ...prev, login_id: e.target.value }))} />
            <input placeholder="Password" type="password" value={newOwner.password} onChange={e => setNewOwner(prev => ({ ...prev, password: e.target.value }))} />
            <div className="modal-actions">
              <button onClick={handleCreateOwner}>Tạo</button>
              <button onClick={() => setShowCreateModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* OWNER LIST */}
      <h3>Owner List</h3>
      <table className="table-hover">
        <thead>
          <tr><th>Slug</th><th>Tên</th><th>Loại</th><th>ID</th><th>Action</th></tr>
        </thead>
        <tbody>
          {ownerList.map(o => (
            <tr key={o.id}>
              <td>{o.slug}</td>
              <td>{o.name}</td>
              <td>{o.type}</td>
              <td>{o.login_id}</td>
              <td>
                <button onClick={() => toggleService(o.id)}>Service</button>
                <button onClick={() => togglePackage(o.id)}>Package</button>
                <button onClick={() => { setOwnerToDelete(o.id); setShowDeleteModal(true); }}>Xoá</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* REQUESTS */}
      <h3>Upgrade Requests</h3>
      <table className="table-hover">
        <thead><tr><th>Owner</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          {requests.map(r => (
            <tr key={r.ownerId}>
              <td>{r.ownerId}</td>
              <td>{r.status}</td>
              <td>
                {r.status === "pending" && <>
                  <button onClick={() => handleApprove(r)}>Approve</button>
                  <button onClick={() => { setOwnerToReject(r.ownerId); setShowRejectModal(true); }}>Reject</button>
                </>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODALS DELETE / REJECT / SUCCESS */}
      {showDeleteModal && <div className="modal-overlay"><div className="modal">
        <p>Xác nhận xoá {ownerToDelete}</p>
        <button onClick={handleDeleteOwner}>Xác nhận</button>
        <button onClick={() => setShowDeleteModal(false)}>Hủy</button>
      </div></div>}

      {showRejectModal && <div className="modal-overlay"><div className="modal">
        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Nhập lý do..." />
        <button onClick={handleReject}>Xác nhận</button>
        <button onClick={() => setShowRejectModal(false)}>Hủy</button>
      </div></div>}

      {showSuccessModal && <div className="modal-overlay"><div className="modal">
        <p>{successMessage}</p>
        <button onClick={() => setShowSuccessModal(false)}>OK</button>
      </div></div>}
    </div>
  );
}