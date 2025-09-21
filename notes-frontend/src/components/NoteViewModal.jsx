import React from "react";

function objectIdTimestamp(id) {
  if (!id || typeof id !== "string" || id.length < 8) return null;
  try {
    const ts = parseInt(id.substring(0, 8), 16) * 1000;
    return new Date(ts);
  } catch (e) {
    return null;
  }
}

function fmtDate(note) {
  const d = note.createdAt || note.updatedAt;
  if (d) {
    try {
      return new Date(d).toLocaleString();
    } catch (e) {}
  }
  const oidDate = objectIdTimestamp(note._id);
  if (oidDate) return oidDate.toLocaleString();
  return "-";
}

export default function NoteViewModal({
  open,
  onClose,
  note,
  onEdit,
  onDelete,
  currentUserId,
}) {
  if (!open || !note) return null;
  const isOwner = Boolean(
    currentUserId &&
      note.createdBy &&
      String(note.createdBy._id || note.createdBy) === String(currentUserId)
  );
  const createdAt = fmtDate(note);
  const author = (() => {
    const cb = note.createdBy;
    if (!cb) return "-";
    if (typeof cb === "string") return cb;
    if (cb.name) return cb.name;
    if (cb.email) return cb.email;
    if (cb._id) return String(cb._id);
    return "-";
  })();
  return (
    <div className="modal-backdrop">
      <div className="card modal-panel">
        <div className="panel-header panel-align-start">
          <div>
            <h3 className="text-xl font-bold">{note.title || "Untitled"}</h3>
            <div className="text-sm text-muted">
              by {author} • {createdAt}
            </div>
          </div>
          <div className="panel-actions gap-2">
            {isOwner && (
              <button className="btn" onClick={() => onEdit(note)}>
                Edit
              </button>
            )}
            {isOwner && (
              <button
                className="btn btn-danger"
                onClick={() => {
                  if (window.confirm("Delete this note?")) onDelete(note._id);
                }}
              >
                Delete
              </button>
            )}
            <button className="btn btn-ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-800 whitespace-pre-wrap">
            {note.content}
          </p>
        </div>
      </div>
    </div>
  );
}
