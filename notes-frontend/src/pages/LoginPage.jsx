import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@acme.test");
  const [password, setPassword] = useState("password");
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Sign in</h2>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-sm text-muted">Email</label>
              <input
                className="input mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-muted">Password</label>
              <input
                type="password"
                className="input mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <button className="btn btn-primary w-full" disabled={loading}>
                {loading ? "Signing..." : "Sign in"}
              </button>
            </div>
            {err && <div className="text-sm text-red-600">{err}</div>}
            <div className="text-xs text-muted mt-2">
              API status: {health ? "🟢 Online" : "🔴 Offline"}
            </div>
            <div className="text-xs text-muted mt-4">
              Test accounts: admin@acme.test, user@acme.test, admin@globex.test,
              user@globex.test (password: password)
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
