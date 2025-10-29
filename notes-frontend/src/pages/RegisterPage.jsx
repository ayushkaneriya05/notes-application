import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useToast } from "../context/ToastContext";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantSlug, setTenantSlug] = useState("acme");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.auth.register({
        name,
        email,
        password,
        tenantSlug,
      });
      // login via auth context is handled by /auth/register response (token + user)
      // store token and navigate
      window.localStorage.setItem("token", res.data.token);
      window.localStorage.setItem("user", JSON.stringify(res.data.user));
      api.setToken(res.data.token);
      toast.success("Registered successfully");
      nav("/");
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err.message ||
        "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-app-bg">
      <div className="auth-shell">
        <div className="auth-panel card auth-panel-modern">
          <aside className="auth-left">
            <div className="logo logo-large">N</div>
            <div className="brand-block">
              <div className="brand-name brand-large">Notes Application</div>
              <div className="brand-sub">Multi-tenant notes platform</div>
            </div>
            <p className="tagline text-muted">
              Create an account within your workspace
            </p>
          </aside>

          <main className="auth-right">
            <div className="form-panel">
              <div className="form-header">
                <h3 className="form-title">Create account</h3>
                <p className="form-subtitle">
                  Register to join your tenant workspace
                </p>
              </div>

              <form
                onSubmit={submit}
                className="space-y-4"
                aria-label="Register form"
              >
                <div>
                  <label className="label">Full name</label>
                  <input
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label className="label">Password</label>
                  <input
                    className="input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="label">Tenant slug</label>
                  <input
                    className="input"
                    value={tenantSlug}
                    onChange={(e) => setTenantSlug(e.target.value)}
                    placeholder="acme"
                  />
                </div>

                <div>
                  <button
                    className="btn btn-primary btn-full"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create account"}
                  </button>
                </div>

                <div className="text-xs text-muted">
                  Already have an account? <a href="/login">Sign in</a>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
