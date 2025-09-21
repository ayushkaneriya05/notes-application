import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import NotesCard from "../components/NotesCard";
import InviteModal from "../components/InviteModal";
import NoteModal from "../components/NoteModal";
import NoteViewModal from "../components/NoteViewModal";
import { useToast } from "../context/ToastContext";

export default function NotesPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [viewNote, setViewNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [err, setErr] = useState(null);

  const {
    success: toastSuccess,
    error: toastError,
    info: toastInfo,
  } = useToast();

  const fetchNotes = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await api.notes.list();
      setNotes(res.data);
    } catch (e) {
      const msg =
        e.response?.data?.error || e.message || "Failed to load notes";
      setErr(msg);
      toastError(msg);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const openAdd = () => {
    setEditingNote(null);
    if (freeLimitReached) {
      toastInfo("Note limit reached — upgrade to Pro for unlimited notes");
      return;
    }
    setNoteModalOpen(true);
  };

  const handleSaveNote = async (payload) => {
    setErr(null);
    // enforce free tier limit
    if (!editingNote && freeLimitReached) {
      const msg = "Note limit reached — upgrade to Pro for unlimited notes";
      setErr(msg);
      toastError(msg);
      return;
    }

    try {
      if (editingNote) {
        const res = await api.notes.update(editingNote._id, payload);
        setNotes((prev) =>
          prev.map((n) => (n._id === editingNote._id ? res.data : n))
        );
        toastSuccess("Note updated");
      } else {
        const res = await api.notes.create(payload);
        setNotes((prev) => [res.data, ...prev]);
        toastSuccess("Note created");
      }
      setNoteModalOpen(false);
      setEditingNote(null);
    } catch (e) {
      const body = e.response?.data;
      const msg = body?.error || e.message || "Failed to save note";
      setErr(msg);
      toastError(msg);
    }
  };

  const handleDelete = async (id) => {
    setErr(null);
    try {
      await api.notes.delete(id);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      setViewNote(null);
      toastSuccess("Note deleted");
    } catch (e) {
      const msg = e.response?.data?.error || e.message || "Delete failed";
      setErr(msg);
      toastError(msg);
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setNoteModalOpen(true);
    setViewNote(null);
  };

  const openView = async (note) => {
    // fetch fresh note data using api.notes.get but don't change behavior on failure
    try {
      const res = await api.notes.get(note._id);
      setViewNote(res.data);
    } catch (e) {
      const msg =
        e.response?.data?.error || e.message || "Failed to fetch note";
      toastError(msg);
      setViewNote(note);
    }
  };

  const handleUpgrade = () => {
    // navigate to the dedicated Upgrade page where the user can confirm
    if (user?.tenant?.plan === "pro") {
      toastInfo && toastInfo("Already on Pro plan");
      return;
    }
    navigate("/upgrade");
  };

  const handleInvite = async (email, role, name) => {
    setErr(null);
    try {
      await api.tenants.invite({ email, role, name }); // include name
      setInviteOpen(false);
      toastSuccess("User invited");
    } catch (e) {
      const msg = e.response?.data?.error || e.message || "Invite failed";
      setErr(msg);
      toastError(msg);
    }
  };

  // plan enforcement for create
  const freeLimitReached = user?.tenant?.plan !== "pro" && notes.length >= 3;

  return (
    <div>
      <Navbar />
      <div className="container mt-6">
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold notes-title">Notes</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                aria-label="Add note"
                title={freeLimitReached ? "Free limit reached" : undefined}
                className="btn btn-primary btn-spaced-sm"
                onClick={openAdd}
                aria-disabled={freeLimitReached}
              >
                Add Note
              </button>
              {user?.role === "admin" && (
                <>
                  <button
                    className={`btn ${
                      user?.tenant?.plan === "pro" ? "btn-ghost" : "btn-primary"
                    } btn-spaced-sm`}
                    onClick={handleUpgrade}
                    disabled={user?.tenant?.plan === "pro"}
                  >
                    {user?.tenant?.plan === "pro"
                      ? "Pro Active"
                      : "Upgrade to Pro"}
                  </button>
                  <button
                    className="btn btn-spaced-md"
                    onClick={() => setInviteOpen(true)}
                  >
                    Invite User
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 12 }}>
          {loading ? (
            <div className="grid-notes">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card skeleton-card skeleton" />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="empty">
              <h3>No notes yet</h3>
              <p className="text-muted">
                Create your first note to get started.
              </p>
              <div className="cta">
                <button
                  className="btn btn-primary"
                  onClick={openAdd}
                  aria-disabled={freeLimitReached}
                >
                  Add Note
                </button>
              </div>
            </div>
          ) : (
            <div className="grid-notes">
              {notes.map((n) => (
                <NotesCard
                  key={n._id}
                  note={n}
                  onOpen={(note) => openView(note)}
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
      <NoteModal
        open={noteModalOpen}
        onClose={() => {
          setNoteModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        initial={editingNote}
      />
      <NoteViewModal
        open={!!viewNote}
        onClose={() => setViewNote(null)}
        note={viewNote}
        onEdit={handleEdit}
        onDelete={handleDelete}
        currentUserId={user?.id}
      />
    </div>
  );
}
