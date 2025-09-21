import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((toast) => {
    const id = ++idCounter;
    const duration = toast.duration ?? 4500;
    setToasts((t) => [...t, { id, ...toast }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const success = useCallback(
    (message, opts) => push({ type: "success", message, ...(opts || {}) }),
    [push]
  );
  const error = useCallback(
    (message, opts) => push({ type: "error", message, ...(opts || {}) }),
    [push]
  );
  const info = useCallback(
    (message, opts) => push({ type: "info", message, ...(opts || {}) }),
    [push]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, push, remove, success, error, info }}
    >
      {children}
      <div className="toast-viewport" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role="status">
            <div className="toast-body">{t.message}</div>
            <button
              className="toast-close"
              onClick={() => remove(t.id)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
