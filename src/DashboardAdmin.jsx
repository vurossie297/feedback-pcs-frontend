// DashboardAdmin.jsx
import React, { useState, useEffect } from "react";
import { loadRequests, saveRequests, loadStatus, saveStatus, loadOwners, saveOwners } from "./storage";
import "./DashboardAdmin.css"; // CSS hover + modal

export default function DashboardAdmin() {
  const [ownerList, setOwnerList] = useState([]);
  const [requests, setRequests] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [editingOwnerId, setEditingOwnerId] = useState(null);
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

  useEffect(() => {
    setOwnerList(loadOwners());
    setRequests(loadRequests());
    setStatusList(loadStatus());
  }, []);

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

    const newOwner = {
      id: newOwnerId,
      password: newOwnerPass,
      slug: newSlug,
      name: newName,
      type: newType
    };

    const updatedOwners = [...ownerList, newOwner];
    setOwnerList(updatedOwners);
    saveOwners(updatedOwners);

    const newStatus = { 
      ownerId: newOwnerId, 
      serviceActive: false, 
      packageActive: false, 
      name: newName, 
      logo: "", 
      bgImg: "", 
      feedbackTitle: "Đánh giá dịch vụ", 
      feedbackSubtitle: "Bạn cảm thấy dịch vụ thế nào?" 
    };
    const updatedStatus = [...statusList, newStatus];
    setStatusList(updatedStatus);
    saveStatus(updatedStatus);

    showSuccess(`✅ Tạo Owner thành công: ${newOwnerId}`);
    setShowCreateModal(false);

    try {
      const response = await fetch(
        "https://feedback-pcs-api.vurossie297.workers.dev/api/business",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: newSlug,
            name: newName,
            type: newType
          }),
        }
      );

      const data = await response.text();
      console.log("STATUS:", response.status);
      console.log("RESPONSE:", data);

    } catch (err) {
      console.error("Lỗi:", err);
    }
  };

  const handleApprove = (req) => {
    setRequests(prev => {
      const updated = prev.map(r => r.ownerId === req.ownerId ? { ...r, status: "approved" } : r);
      saveRequests(updated);
      return updated;
    });
    setStatusList(prev => {
      const updated = prev.map(s => s.ownerId === req.ownerId ? { ...s, serviceActive: true } : s);
      saveStatus(updated);
      return updated;
    });
    setRequestSuccessMessage(`✅ Đã duyệt dịch vụ cho ${req.ownerId}`);
    setShowRequestSuccessModal(true);
  };

  const openRejectModal = (ownerId) => {
    setOwnerToReject(ownerId);
    setRejectReason(""); 
    setShowRejectModal(true);
  };
  
  const handleConfirmReject = () => {
    if (!rejectReason) return alert("Vui lòng nhập lý do từ chối");

    setRequests(prev => {
      const updated = prev.map(r =>
        r.ownerId === ownerToReject ? { ...r, status: "rejected", note: rejectReason } : r
      );
      saveRequests(updated);
      return updated;
    });

    setSuccessMessage(`❌ Đã từ chối ${ownerToReject}`);
    setShowSuccessModal(true);

    setOwnerToReject(null);
    setRejectReason("");
    setShowRejectModal(false);
  };

  const toggleService = (ownerId) => {
    setStatusList(prev => {
      const updated = prev.map(s => s.ownerId === ownerId ? { ...s, serviceActive: !s.serviceActive } : s);
      saveStatus(updated);
      return updated;
    });
  };

  const togglePackage = (ownerId) => {
    setStatusList(prev => {
      const updated = prev.map(s => s.ownerId === ownerId ? { ...s, packageActive: !s.packageActive } : s);
      saveStatus(updated);
      return updated;
    });
  };

  const handleEditOwner = (ownerId) => {
    setEditingOwnerId(ownerId);
    const s = statusList.find(s => s.ownerId === ownerId);
    setServiceEditing({ ...s });
    setLogoFile(null);
    setBgFile(null);
  };

  const openDeleteModal = (ownerId) => {
    setOwnerToDelete(ownerId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!ownerToDelete) return;

    const updatedOwners = ownerList.filter(o => o.id !== ownerToDelete);
    setOwnerList(updatedOwners);
    saveOwners(updatedOwners);

    const updatedStatus = statusList.filter(s => s.ownerId !== ownerToDelete);
    setStatusList(updatedStatus);
    saveStatus(updatedStatus);

    showSuccess(`✅ Đã xoá Owner: ${ownerToDelete}`);
    setShowDeleteModal(false);
    setOwnerToDelete(null);
  };

  const handleSaveEditing = () => {
    if (!serviceEditing) return;
    const saveFiles = () => {
      if (logoFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
          serviceEditing.logo = reader.result;
          saveBgFile();
        };
        reader.readAsDataURL(logoFile);
      } else saveBgFile();
    };
    const saveBgFile = () => {
      if (bgFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
          serviceEditing.bgImg = reader.result;
          finalizeSave();
        };
        reader.readAsDataURL(bgFile);
      } else finalizeSave();
    };
    const finalizeSave = () => {
      const finalStatusList = statusList.map(s => s.ownerId === editingOwnerId ? serviceEditing : s);
      setStatusList(finalStatusList);
      saveStatus(finalStatusList);
      showSuccess(`✅ Lưu ${editingOwnerId} thành công!`);
      setEditingOwnerId(null);
      setServiceEditing(null);
      setLogoFile(null);
      setBgFile(null);
    };
    saveFiles();
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
  };

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
              <td>{o.id}</td>
              <td>{o.password}</td>
              <td>
                <button className="secondary-btn action-btn" onClick={() => handleEditOwner(o.id)}>Chỉnh sửa</button>
                <button className="delete-btn action-btn" onClick={() => openDeleteModal(o.id)}>Xoá</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL DELETE */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Xác nhận xoá Owner</h3>
            <p>Bạn có chắc muốn xoá: <b>{ownerToDelete}</b> không?</p>
            <div className="modal-actions .confirm-modal button">
              <button className="primary-btn" onClick={handleConfirmDelete}>Xác nhận</button>
              <button className="secondary-btn" onClick={() => setShowDeleteModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REJECT */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Nhập lý do từ chối</h3>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Nhập lý do..."
              rows={4}
              style={{ width: "100%", padding: "8px", marginBottom: "16px", borderRadius: "6px", border: "1px solid #aaa" }}
            />
            <div className="modal-actions confirm-modal">
              <button className="primary-btn" onClick={handleConfirmReject}>Xác nhận</button>
              <button className="secondary-btn" onClick={() => setShowRejectModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT OWNER */}
      {editingOwnerId && serviceEditing && (
        <div className="edit-owner-form">
          <h3>Chỉnh sửa Owner: {editingOwnerId}</h3>
          <label>Tên khách sạn / nhà hàng</label>
          <input type="text" value={serviceEditing.name || ""} onChange={e => setServiceEditing(prev => ({ ...prev, name: e.target.value }))} />

          <label>Logo tròn</label>
          <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} />
          {serviceEditing.logo && <img src={serviceEditing.logo} alt="logo" className="preview-img" />}

          <label>Ảnh nền card</label>
          <input type="file" accept="image/*" onChange={e => setBgFile(e.target.files[0])} />
          {serviceEditing.bgImg && <img src={serviceEditing.bgImg} alt="background" className="preview-img bg-img" />}

          <label>Text tiêu đề feedback</label>
          <input type="text" value={serviceEditing.feedbackTitle || ""} onChange={e => setServiceEditing(prev => ({ ...prev, feedbackTitle: e.target.value }))} />

          <label>Text câu hỏi feedback</label>
          <input type="text" value={serviceEditing.feedbackSubtitle || ""} onChange={e => setServiceEditing(prev => ({ ...prev, feedbackSubtitle: e.target.value }))} />

          <button className="primary-btn" onClick={handleSaveEditing}>Lưu thay đổi</button>
        </div>
      )}

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
              <td>{req.ownerId}</td>
              <td>{req.type}</td>
              <td>{req.status}</td>
              <td>{new Date(req.createdAt).toLocaleString()}</td>
              <td>
                {req.status === "pending" ? (
                  <>
                    <button className="secondary-btn small-btn action-btn " onClick={() => handleApprove(req)}>Approve</button>
                    <button className="secondary-btn small-btn action-btn" onClick={() => openRejectModal(req.ownerId)}>Reject</button>
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
              <td>{s.ownerId}</td>
              <td>{s.serviceActive ? "✅" : "❌"}</td>
              <td>{s.packageActive ? "✅" : "❌"}</td>
              <td>
                <button className="secondary-btn small-btn action-btn" onClick={() => toggleService(s.ownerId)}>Service</button>
                <button className="secondary-btn small-btn action-btn" onClick={() => togglePackage(s.ownerId)}>Package</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}