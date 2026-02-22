// DashboardAdmin.jsx
import React, { useState, useEffect } from "react";
import "./DashboardAdmin.css";

export default function DashboardAdmin() {
  const [ownerList, setOwnerList] = useState([]);
  const [requests, setRequests] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [editingOwnerSlug, setEditingOwnerSlug] = useState(null);
  const [serviceEditing, setServiceEditing] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [bgFile, setBgFile] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showRequestSuccessModal, setShowRequestSuccessModal] = useState(false);
  const [requestSuccessMessage, setRequestSuccessMessage] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [ownerToReject, setOwnerToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Modal tạo Owner
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("restaurant");
  const [newOwnerId, setNewOwnerId] = useState("");
  const [newOwnerPass, setNewOwnerPass] = useState("");

  // =========================
  // FETCH DATA
  // =========================
  const fetchOwners = async () => {
    try {
      const res = await fetch("/api/business/all");
      const data = await res.json();
      setOwnerList(data || []);
    } catch (err) {
      console.error("Fetch owners error:", err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/upgrade-request");
      const data = await res.json();
      setRequests(data || []);
    } catch (err) {
      console.error("Fetch requests error:", err);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/status/all");
      const data = await res.json();
      setStatusList(data || []);
    } catch (err) {
      console.error("Fetch status error:", err);
    }
  };

  useEffect(() => {
    fetchOwners();
    fetchRequests();
    fetchStatus();
  }, []);

  // =========================
  // CREATE OWNER
  // =========================
  const openCreateModal = () => {
    setNewSlug("");
    setNewName("");
    setNewType("restaurant");
    setNewOwnerId("");
    setNewOwnerPass("");
    setShowCreateModal(true);
  };

  const handleCreateOwnerFromModal = async () => {
    if (!newSlug) return alert("Slug không được để trống");
    if (ownerList.find(o => o.slug === newSlug)) return alert("Slug đã tồn tại!");
    if (!newName) return alert("Tên không được để trống");
    if (!newOwnerId) return alert("ID login không được để trống");
    if (!newOwnerPass) return alert("Password không được để trống");

    try {
      const res = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: newSlug,
          name: newName,
          type: newType,
          ownerId: newOwnerId,
          password: newOwnerPass
        }),
      });
      if (!res.ok) throw new Error("Tạo Owner thất bại");
      const data = await res.json();
      showSuccess(`✅ Tạo Owner thành công: ${data.slug}`);
      setShowCreateModal(false);
      fetchOwners();
      fetchStatus();
    } catch (err) {
      console.error(err);
      alert("Tạo Owner thất bại");
    }
  };

  // =========================
  // APPROVE / REJECT REQUEST
  // =========================
  const handleApprove = async (req) => {
    try {
      const res = await fetch("/api/upgrade-request/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: req.slug }),
      });
      if (!res.ok) throw new Error("Duyệt thất bại");
      setRequestSuccessMessage(`✅ Đã duyệt dịch vụ cho ${req.slug}`);
      setShowRequestSuccessModal(true);
      fetchRequests();
      fetchStatus();
    } catch (err) {
      console.error(err);
      alert("Duyệt thất bại");
    }
  };

  const openRejectModal = (slug) => {
    setOwnerToReject(slug);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectReason) return alert("Vui lòng nhập lý do từ chối");
    try {
      const res = await fetch("/api/upgrade-request/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: ownerToReject, note: rejectReason }),
      });
      if (!res.ok) throw new Error("Từ chối thất bại");
      setSuccessMessage(`❌ Đã từ chối ${ownerToReject}`);
      setShowSuccessModal(true);
      setShowRejectModal(false);
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Từ chối thất bại");
    }
  };

  // =========================
  // TOGGLE SERVICE / PACKAGE
  // =========================
  const toggleService = async (slug) => {
    try {
      const s = statusList.find(s => s.slug === slug);
      const res = await fetch(`/api/status/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceActive: !s.serviceActive }),
      });
      if (!res.ok) throw new Error("Toggle service thất bại");
      fetchStatus();
    } catch (err) {
      console.error(err);
      alert("Toggle service thất bại");
    }
  };

  const togglePackage = async (slug) => {
    try {
      const s = statusList.find(s => s.slug === slug);
      const res = await fetch(`/api/status/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageActive: !s.packageActive }),
      });
      if (!res.ok) throw new Error("Toggle package thất bại");
      fetchStatus();
    } catch (err) {
      console.error(err);
      alert("Toggle package thất bại");
    }
  };

  // =========================
  // EDIT OWNER
  // =========================
  const handleEditOwner = (slug) => {
    setEditingOwnerSlug(slug);
    const s = statusList.find(s => s.slug === slug);
    setServiceEditing({ ...s });
    setLogoFile(null);
    setBgFile(null);
  };

  const handleSaveEditing = async () => {
    if (!serviceEditing) return;

    const formData = new FormData();
    formData.append("name", serviceEditing.name || "");
    formData.append("feedbackTitle", serviceEditing.feedbackTitle || "");
    formData.append("feedbackSubtitle", serviceEditing.feedbackSubtitle || "");
    if (logoFile) formData.append("logo", logoFile);
    if (bgFile) formData.append("bgImg", bgFile);

    try {
      const res = await fetch(`/api/status/${editingOwnerSlug}`, {
        method: "PUT",
        body: formData
      });
      if (!res.ok) throw new Error("Lưu thất bại");
      showSuccess(`✅ Lưu ${editingOwnerSlug} thành công!`);
      setEditingOwnerSlug(null);
      setServiceEditing(null);
      setLogoFile(null);
      setBgFile(null);
      fetchStatus();
    } catch (err) {
      console.error(err);
      alert("Lưu thất bại");
    }
  };

  // =========================
  // DELETE OWNER
  // =========================
  const openDeleteModal = (slug) => {
    setOwnerToDelete(slug);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!ownerToDelete) return;
    try {
      const res = await fetch(`/api/business/${ownerToDelete}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Xoá thất bại");
      showSuccess(`✅ Đã xoá Owner: ${ownerToDelete}`);
      setShowDeleteModal(false);
      setOwnerToDelete(null);
      fetchOwners();
      fetchStatus();
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Xoá thất bại");
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">PCS ADMIN</h2>

      <button className="create-owner-btn" onClick={openCreateModal}>➕ Tạo Owner mới</button>

      {/* MODAL TẠO OWNER */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Tạo Owner mới</h3>
            <label>Slug:</label>
            <input type="text" value={newSlug} onChange={e => setNewSlug(e.target.value)} />
            <label>Tên:</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} />
            <label>Loại:</label>
            <select value={newType} onChange={e => setNewType(e.target.value)}>
              <option value="restaurant">Restaurant</option>
              <option value="hotel">Hotel</option>
              <option value="other">Other</option>
            </select>
            <label>ID login:</label>
            <input type="text" value={newOwnerId} onChange={e => setNewOwnerId(e.target.value)} />
            <label>Password:</label>
            <input type="password" value={newOwnerPass} onChange={e => setNewOwnerPass(e.target.value)} />
            <div className="modal-actions">
              <button className="primary-btn" onClick={handleCreateOwnerFromModal}>Tạo</button>
              <button className="secondary-btn" onClick={() => setShowCreateModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUCCESS */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p>{successMessage}</p>
            <div className="modal-actions">
              <button className="primary-btn" onClick={() => setShowSuccessModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* OWNER LIST */}
      <h3>Owner List</h3>
      <table className="table-hover">
        <thead>
          <tr>
            <th>Slug</th>
            <th>Tên</th>
            <th>Loại</th>
            <th>ID login</th>
            <th>Password</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {ownerList.map((o, idx) => (
            <tr key={idx}>
              <td>{o.slug}</td>
              <td>{o.name}</td>
              <td>{o.type}</td>
              <td>{o.ownerId || "—"}</td>
              <td>{o.password || "—"}</td>
              <td>
                <button className="secondary-btn action-btn" onClick={() => handleEditOwner(o.slug)}>Chỉnh sửa</button>
                <button className="delete-btn action-btn" onClick={() => openDeleteModal(o.slug)}>Xoá</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* UPGRADE REQUESTS */}
      <h3>Upgrade Requests</h3>
      <table className="table-hover">
        <thead>
          <tr>
            <th>Owner</th>
            <th>Type</th>
            <th>Status</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req, idx) => (
            <tr key={idx}>
              <td>{req.slug}</td>
              <td>{req.type}</td>
              <td>{req.status}</td>
              <td>{new Date(req.createdAt).toLocaleString()}</td>
              <td>
                {req.status === "pending" ? (
                  <>
                    <button className="secondary-btn small-btn action-btn" onClick={() => handleApprove(req)}>Approve</button>
                    <button className="secondary-btn small-btn action-btn" onClick={() => openRejectModal(req.slug)}>Reject</button>
                  </>
                ) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* SERVICE STATUS */}
      <h3>Service Status</h3>
      <table className="table-hover">
        <thead>
          <tr>
            <th>Owner</th>
            <th>Service Active</th>
            <th>Package Active</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {statusList.map((s, idx) => (
            <tr key={idx}>
              <td>{s.slug}</td>
              <td>{s.serviceActive ? "✅" : "❌"}</td>
              <td>{s.packageActive ? "✅" : "❌"}</td>
              <td>
                <button className="secondary-btn small-btn action-btn" onClick={() => toggleService(s.slug)}>Service</button>
                <button className="secondary-btn small-btn action-btn" onClick={() => togglePackage(s.slug)}>Package</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}