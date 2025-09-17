import React, { useState } from "react";

export default function InviteModal({ open, onClose, onInvite }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="card" style={{ minWidth: 360 }}>
        <h3 className="text-lg font-bold">Invite User</h3>
        <div className="mt-4">
          <label className="text-sm text-muted">Email</label>
          <input
            className="input mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
          />
        </div>
        <div className="mt-3">
          <label className="text-sm text-muted">Role</label>
          <select
            className="input mt-1"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onInvite(email, role)}
          >
            Invite
          </button>
        </div>
      </div>
    </div>
  );
}
