import React from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";

export default function UpgradePage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const {
    success: toastSuccess,
    error: toastError,
    info: toastInfo,
  } = useToast();

  const doUpgrade = async () => {
    if (!user) return toastError ? toastError("No user available") : null;
    if (user.tenant?.plan === "pro") {
      toastInfo && toastInfo("Already Pro");
      return;
    }
    try {
      await api.tenants.upgrade(user.tenant.slug);
      const updated = { ...user, tenant: { ...user.tenant, plan: "pro" } };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      toastSuccess &&
        toastSuccess("Upgraded to Pro — unlimited notes unlocked");
      navigate("/");
    } catch (e) {
      const msg = e.response?.data?.error || e.message || "Upgrade failed";
      toastError && toastError(msg);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mt-8">
        <div className="back-link-row">
          <button
            className="btn btn-ghost btn-spaced-sm"
            onClick={() => navigate("/")}
          >
            ← Back to Notes
          </button>
        </div>

        <div className="card max-w-lg mx-auto upgrade-panel">
          <div className="upgrade-header">
            <h3 className="text-xl font-bold">
              Upgrade {user?.tenant?.name} to Pro
            </h3>
            <div className="tag">Current plan: {user?.tenant?.plan}</div>
          </div>
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
