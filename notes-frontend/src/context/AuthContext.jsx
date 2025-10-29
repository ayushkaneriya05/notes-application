import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  api.setToken(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const login = ({ token: t, user: u }) => {
    setToken(t);
    setUser(u);
    api.setToken(t);
  };
  const logout = () => {
    setToken(null);
    setUser(null);
    api.setToken(null);
    window.location.href = "/login";
  };

  useEffect(() => {
    if (token) api.setToken(token);
    else api.setToken(null);
  }, [token]);

  // If we have a token but no user, fetch /auth/me to hydrate the user
  useEffect(() => {
    let mounted = true;
    const hydrate = async () => {
      if (!token) return;
      if (user) return;
      try {
        const res = await api.auth.me();
        if (!mounted) return;
        setUser(res.data);
      } catch (e) {
        console.warn("Failed to fetch /auth/me", e?.message || e);
        // token likely invalid - clear and redirect to login
        setToken(null);
        api.setToken(null);
        window.location.href = "/login";
      }
    };
    hydrate();
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
