import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const instance = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

function setToken(token) {
  if (token)
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete instance.defaults.headers.common["Authorization"];
}

// Response interceptor to handle auth errors globally
instance.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      // Force a full reload to ensure context resets (simpler than trying to reach AuthContext)
      try {
        window.location.href = "/login";
      } catch (e) {
        /* ignore - server side */
        console.log(e);
      }
    }
    return Promise.reject(err);
  }
);

export default {
  instance,
  setToken,
  auth: {
    login: (e, p) => instance.post("/auth/login", { email: e, password: p }),
    changePassword: (payload) =>
      instance.post("/auth/change-password", payload),
    register: (payload) => instance.post("/auth/register", payload),
    me: () => instance.get("/auth/me"),
  },
  notes: {
    list: () => instance.get("/notes"),
    create: (payload) => instance.post("/notes", payload),
    update: (id, payload) => instance.put(`/notes/${id}`, payload),
    delete: (id) => instance.delete(`/notes/${id}`),
    get: (id) => instance.get(`/notes/${id}`),
  },
  tenants: {
    upgrade: (slug) => instance.post(`/tenants/${slug}/upgrade`),
    invite: (payload) => instance.post(`/tenants/invite`, payload),
  },
  health: () => instance.get("/health"),
};
