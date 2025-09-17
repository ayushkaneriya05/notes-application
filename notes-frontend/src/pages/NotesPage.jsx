import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import NotesCard from "../components/NotesCard";
import InviteModal from "../components/InviteModal";

export default function NotesPage() {
  const { user, token, setUser } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [err, setErr] = useState(null);

  const fetchNotes = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await api.notes.list();
      setNotes(res.data);
    } catch (e) {
      setErr("Failed to load notes");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const addNote = async () => {
    setErr(null);
    try {
      const res = await api.notes.create({ title: "Note", content });
      setNotes((prev) => [res.data, ...prev]);
      setContent("");
    } catch (e) {
      const body = e.response?.data;
      setErr(body?.error || "Failed to create note");
    }
  };
  const deleteNote = async (id) => {
    try {
      await api.notes.delete(id);
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (e) {
      alert("Delete failed");
    }
  };

  const updateNote = async (id, payload) => {
    try {
      const res = await api.notes.update(id, payload);
      setNotes((prev) => prev.map((n) => (n._id === id ? res.data : n)));
    } catch (e) {
      alert("Update failed");
    }
  };

  const handleUpgrade = async () => {
    if (user?.tenant?.plan === "pro") return alert("Already Pro");
    try {
      await api.tenants.upgrade(user.tenant.slug);
      // update local user tenant plan
      const updatedUser = { ...user, tenant: { ...user.tenant, plan: "pro" } };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      alert("Upgraded to Pro");
    } catch (e) {
      alert("Upgrade failed");
    }
  };

  const handleInvite = async (email, role) => {
    try {
      await api.tenants.invite({ email, role }); // no slug now
      alert("User invited. Default password: password");
      setInviteOpen(false);
    } catch (e) {
      alert("Invite failed: " + (e.response?.data?.error || e.message));
    }
  };

  // plan enforcement for create
  const freeLimitReached = user?.tenant?.plan !== "pro" && notes.length >= 3;
  return (
    <div>
      <Navbar />
      <div className="container mt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Notes</h2>
            <div className="text-sm text-muted">
              {user?.tenant?.name} — {user?.role}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user?.role === "admin" && (
              <>
                <button
                  className={`btn ${
                    user?.tenant?.plan === "pro" ? "btn-ghost" : "btn-primary"
                  }`}
                  onClick={handleUpgrade}
                  disabled={user?.tenant?.plan === "pro"}
                >
                  {user?.tenant?.plan === "pro"
                    ? "Pro Active"
                    : "Upgrade to Pro"}
                </button>
                <button className="btn" onClick={() => setInviteOpen(true)}>
                  Invite User
                </button>
              </>
            )}
          </div>
        </div>

        <div className="card mb-6">
          <div className="flex gap-3">
            <textarea
              className="input"
              placeholder="Write a note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={2}
            />
            <div className="flex flex-col justify-between">
              <button
                className="btn btn-primary"
                onClick={addNote}
                disabled={freeLimitReached}
              >
                Add
              </button>
              {freeLimitReached && (
                <div className="text-xs text-yellow-700 mt-2">
                  Free plan limit reached (3). Upgrade to add more.
                </div>
              )}
            </div>
          </div>
          {err && <div className="text-sm text-red-600 mt-2">{err}</div>}
        </div>

        <div>
          {loading ? (
            <div className="text-muted">Loading...</div>
          ) : (
            <div className="grid-notes">
              {notes.map((n) => (
                <NotesCard
                  key={n._id}
                  note={n}
                  onDelete={deleteNote}
                  onUpdate={updateNote}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInvite}
      />
    </div>
  );
}
