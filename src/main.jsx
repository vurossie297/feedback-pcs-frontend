import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Các page
import LoginOwner from "./LoginOwner.jsx";
import LoginAdmin from "./LoginAdmin.jsx";
import DashboardOwner from "./DashboardOwner.jsx";
import DashboardAdmin from "./DashboardAdmin.jsx";
import FeedbackPage from "./FeedbackPage.jsx";

// Render
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/" element={<LoginOwner />} />
        <Route path="/login-owner" element={<LoginOwner />} />
        <Route path="/login-admin" element={<LoginAdmin />} />

        {/* Dashboard */}
        <Route path="/dashboard-owner/:ownerId" element={<DashboardOwner />} />
        <Route path="/dashboard-admin" element={<DashboardAdmin />} />

        {/* Feedback page */}
        <Route path="/feedback/:ownerId" element={<FeedbackPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);






