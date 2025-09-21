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

function formatCreator(createdBy) {
  if (!createdBy) return "-";
  if (typeof createdBy === "string") return createdBy;
  if (createdBy.name) return createdBy.name;
  if (createdBy.email) return createdBy.email;
  if (createdBy._id) return String(createdBy._id);
  return JSON.stringify(createdBy);
}

export default function NotesCard({ note, onOpen }) {
  const title = note.title || "Untitled";
  const createdAt = fmtDate(note);
  const createdBy = formatCreator(note.createdBy);

  return (
    <div
      className="card note-card note-row clickable"
      onClick={() => onOpen(note)}
    >
      <div className="note-row-content">
        <div className="note-row-text">
          <div className="note-title">{title}</div>
        </div>
        <div className="note-meta text-xs">
          {createdBy} • {createdAt}
        </div>
      </div>
    </div>
  );
}
