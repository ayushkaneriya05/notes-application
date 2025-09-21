import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState(false);
  const [err, setErr] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    api
      .health()
      .then(() => setHealth(true))
      .catch(() => setHealth(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      login(res.data);
      nav("/");
    } catch (err) {
      setErr(err.response?.data?.error || "Login failed");
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
              Securely create and share notes across your team — simple,
              private, and fast.
            </p>
          </aside>

          <main className="auth-right">
            <div className="form-panel">
              <div className="form-header">
                <h3 className="form-title">Sign in to your account</h3>
                <p className="form-subtitle">
                  Enter your credentials to continue
                </p>
              </div>

              <form
                onSubmit={submit}
                className="space-y-4"
                aria-label="Sign in form"
              >
                <div>
                  <label className="label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    aria-label="email"
                    className="input"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="label" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    aria-label="password"
                    className="input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {err && <div className="text-sm text-red-600">{err}</div>}

                <div className="helper-row">
                  <div className="text-xs text-muted">
                    API status: {health ? "🟢 Online" : "🔴 Offline"}
                  </div>
                </div>

                <div>
                  <button
                    className="btn btn-primary btn-full"
                    type="submit"
                    disabled={loading}
                    aria-disabled={loading}
                  >
                    {loading ? "Signing..." : "Sign in"}
                  </button>
                </div>

                <div className="text-xs text-muted mt-2">
                  <div>Test accounts:</div>
                  <div>admin@acme.test (password: password)</div>
                  <div>user@acme.test (password: password)</div>
                  <div>admin@globex.test (password: password)</div>
                  <div>user@globex.test (password: password)</div>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
