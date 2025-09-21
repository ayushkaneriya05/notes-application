import React, { useState, useEffect, useRef } from "react";

export default function NoteModal({ open, onClose, onSave, initial }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [content, setContent] = useState(initial?.content || "");
  const titleRef = useRef(null);

  useEffect(() => {
    setTitle(initial?.title || "");
    setContent(initial?.content || "");
  }, [initial]);

  useEffect(() => {
    if (open && titleRef.current) titleRef.current.focus();
  }, [open]);

  const save = () => {
    if (!title.trim() && !content.trim()) return; // simple validation
    onSave({ title: title.trim() || "Untitled", content: content.trim() });
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="card modal-panel">
        <div className="panel-header">
          <h3 className="text-lg font-bold">
            {initial ? "Edit Note" : "Create Note"}
          </h3>
          <div className="text-sm text-muted">Keep notes concise and clear</div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label className="label">Title</label>
          <input
            ref={titleRef}
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            aria-label="Note title"
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label className="label">Content</label>
          <textarea
            className="input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="Write your note..."
            aria-label="Note content"
          />
        </div>

        <div className="panel-actions" style={{ marginTop: 16 }}>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
