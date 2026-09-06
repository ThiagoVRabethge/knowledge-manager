import { useState, useEffect, useCallback } from "react";
import { API_URL, authFetch } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function useTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/templates`);
      const data = await res.json();
      setTemplates(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createTemplate = useCallback(async (name, content = "") => {
    const res = await authFetch(`${API_URL}/templates`, {
      method: "POST",
      body: JSON.stringify({ name, content }),
    });
    if (!res.ok) throw new Error("Failed to create template");
    const created = await res.json();
    setTemplates((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateTemplate = useCallback(async (id, updates) => {
    const res = await authFetch(`${API_URL}/templates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update template");
    const updated = await res.json();
    setTemplates((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  const deleteTemplate = useCallback(async (id) => {
    const res = await authFetch(`${API_URL}/templates/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete template");
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (user) fetchTemplates();
  }, [user, fetchTemplates]);

  return {
    templates,
    loading,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}