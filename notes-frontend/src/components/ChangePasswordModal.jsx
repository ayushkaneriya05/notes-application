import React, { useState } from "react";
import api from "../lib/api";
import { useToast } from "../context/ToastContext";

export default function ChangePasswordModal({ open, onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const save = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Please provide current and new password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }
    setLoading(true);
    try {
      await api.auth.changePassword({ currentPassword, newPassword });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (e) {
      const msg =
        e.response?.data?.error || e.message || "Failed to change password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="card modal-panel">
        <div className="panel-header">
          <h3 className="text-lg font-bold">Change Password</h3>
          <div className="text-sm text-muted">Update your account password</div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label className="label">Current password</label>
          <input
            type="password"
            className="input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label className="label">New password</label>
          <input
            type="password"
            className="input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label className="label">Confirm new password</label>
          <input
            type="password"
            className="input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
        </div>

        <div className="panel-actions" style={{ marginTop: 16 }}>
          <button className="btn" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
