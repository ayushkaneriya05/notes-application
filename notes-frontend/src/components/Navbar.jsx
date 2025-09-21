import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ChangePasswordModal from "./ChangePasswordModal";

export default function Navbar() {
  const { user, logout } = useAuth();
  const initials = ((user?.name || user?.email || "S")[0] || "S").toUpperCase();
  const [changeOpen, setChangeOpen] = useState(false);

  return (
    <div className="topbar">
      <div className="container topbar-inner">
        <div className="brand">
          <div className="logo">N</div>
          <div className="brand-info">
            <div className="brand-name">Notes Application</div>
            <div className="brand-sub text-muted">
              {user?.tenant?.name ? `${user.tenant.name} workspace` : ""}
            </div>
          </div>
        </div>

        <div className="actions">
          <div className="user user-actions">
            <div className="avatar">{initials}</div>
            <div className="user-info-column">
              <div className="user-name">
                {user?.name
                  ? `${user.name} • ${user?.role || ""}`
                  : user?.role || ""}
              </div>
              <div className="user-email text-muted">{user?.email}</div>
            </div>
            <button
              className="btn btn-ghost btn-spaced-sm"
              onClick={() => setChangeOpen(true)}
            >
              Change password
            </button>
            <button className="btn btn-ghost" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>
      <ChangePasswordModal
        open={changeOpen}
        onClose={() => setChangeOpen(false)}
      />
    </div>
  );
}
