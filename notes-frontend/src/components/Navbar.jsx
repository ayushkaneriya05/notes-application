import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <div
      className="card flex items-center justify-between"
      style={{ borderRadius: 0 }}
    >
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold">SaaS Notes</div>
          <div className="text-sm text-muted">
            {user?.tenant?.name || ""} workspace
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted">{user?.email}</div>
          <button className="btn btn-ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
