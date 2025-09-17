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

export default {
  instance,
  setToken,
  auth: {
    login: (e, p) => instance.post("/auth/login", { email: e, password: p }),
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
