import React from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export default function UpgradePage() {
  const { user, setUser } = useAuth();
  const doUpgrade = async () => {
    if (user.tenant.plan === "pro") return alert("Already Pro");
    try {
      await api.tenants.upgrade(user.tenant.slug);
      const updated = { ...user, tenant: { ...user.tenant, plan: "pro" } };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      alert("Upgraded");
    } catch (e) {
      alert("Upgrade failed");
    }
  };
  return (
    <div>
      <Navbar />
      <div className="container mt-8">
        <div className="card max-w-lg mx-auto">
          <h3 className="text-xl font-bold">
            Upgrade {user?.tenant?.name} to Pro
          </h3>
          <p className="text-muted mt-2">
            Pro plan removes the 3-note limit and allows unlimited notes.
          </p>
          <div className="mt-4">
            <button className="btn btn-primary" onClick={doUpgrade}>
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
