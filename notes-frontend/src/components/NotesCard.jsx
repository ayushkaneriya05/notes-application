import React, { useState } from "react";
import { Trash2, Edit, Check } from "lucide-react";

export default function NotesCard({ note, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(note.content || "");

  const handleSave = () => {
    onUpdate(note._id, { title: note.title || "Note", content });
    setEditing(false);
  };

  return (
    <div className="card">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {editing ? (
            <textarea
              className="input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          ) : (
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {note.content}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end ml-3 gap-2">
          {editing ? (
            <button className="btn" onClick={handleSave}>
              <Check size={16} /> Save
            </button>
          ) : (
            <button className="btn" onClick={() => setEditing(true)}>
              <Edit size={16} /> Edit
            </button>
          )}
          <button className="btn btn-danger" onClick={() => onDelete(note._id)}>
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>
      <div className="text-xs text-muted mt-2">
        Updated: {new Date(note.updatedAt || note.createdAt).toLocaleString()}
      </div>
    </div>
  );
}
