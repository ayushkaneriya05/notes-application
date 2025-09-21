import React, { useState } from "react";

export default function InviteModal({ open, onClose, onInvite }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("member");
  const [localErr, setLocalErr] = useState("");
  if (!open) return null;

  const validateEmail = (e) => {
    setEmail(e);
    setLocalErr("");
    const re = /\S+@\S+\.\S+/;
    if (e && !re.test(e)) setLocalErr("Invalid email");
  };

  const doInvite = () => {
    if (!email) return setLocalErr("Email required");
    if (localErr) return;
    onInvite(email, role, name);
  };

  return (
    <div className="modal-backdrop">
      <div className="card modal-panel">
        <div className="panel-header">
          <h3 className="text-lg font-bold">Invite user to workspace</h3>
          <div className="text-sm text-muted">
            Invite a colleague with a temporary password
          </div>
        </div>

        <div className="mt-12">
          <label className="label">Full name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            aria-label="Invite name"
          />
        </div>

        <div className="mt-12">
          <label className="label">Email</label>
          <input
            className="input"
            value={email}
            onChange={(e) => validateEmail(e.target.value)}
            placeholder="user@example.com"
            aria-label="Invite email"
          />
          {localErr && (
            <div className="text-sm text-red-600 mt-2">{localErr}</div>
          )}
        </div>

        <div className="mt-12">
          <label className="label">Role</label>
          <select
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="panel-actions mt-16">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={doInvite}
            disabled={!email || !!localErr}
          >
            Invite
          </button>
        </div>
      </div>
    </div>
  );
}
