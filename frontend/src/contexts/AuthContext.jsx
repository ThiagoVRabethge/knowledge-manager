import { API_URL, authFetch } from "@/lib/utils";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setLoading(false);

      return;
    }

    authFetch(`${API_URL}/auth/me`)
      .then((r) => {
        if (!r.ok) throw new Error("Invalid token");

        return r.json();
      })
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem("access_token");

        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (code) => {
    const res = await fetch(`${API_URL}/auth/github`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (!res.ok) {
      const err = await res.json();

      throw new Error(err.detail || "Login failed");
    }

    const data = await res.json();

    localStorage.setItem("access_token", data.access_token);

    const meRes = await authFetch(`${API_URL}/auth/me`);

    if (!meRes.ok) {
      localStorage.removeItem("access_token");

      throw new Error("Failed to fetch user");
    }

    const userData = await meRes.json();

    setUser(userData);
  };

  const logout = async () => {
    try {
      await authFetch(`${API_URL}/auth/logout`, { method: "POST" });
    } catch (e) {
      console.error("Logout failed", e);
    }

    localStorage.removeItem("access_token");

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) throw new Error("useAuth must be used within AuthProvider");

  return ctx;
}
