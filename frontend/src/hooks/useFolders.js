import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function useFolders() {
  const { token } = useAuth();
  const [folders, setFolders] = useState([]);
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(false);

  const headers = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchFolders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/folders`, { headers: headers() });
      const data = await res.json();
      setFolders(data);
    } finally {
      setLoading(false);
    }
  }, [token, headers]);

  const fetchTree = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/folders/tree`, { headers: headers() });
      const data = await res.json();
      setTree(data);
    } catch (e) {
      console.error(e);
    }
  }, [token, headers]);

  const createFolder = useCallback(async (name, parentId) => {
    const res = await fetch(`${API_URL}/folders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers() },
      body: JSON.stringify({ name, parent_id: parentId || null }),
    });
    if (!res.ok) throw new Error("Failed to create folder");
    await fetchTree();
    await fetchFolders();
    return res.json();
  }, [headers, fetchTree, fetchFolders]);

  const deleteFolder = useCallback(async (id) => {
    const res = await fetch(`${API_URL}/folders/${id}`, {
      method: "DELETE",
      headers: headers(),
    });
    if (!res.ok) throw new Error("Failed to delete folder");
    await fetchTree();
    await fetchFolders();
  }, [headers, fetchTree, fetchFolders]);

  useEffect(() => {
    if (token) {
      fetchFolders();
      fetchTree();
    }
  }, [token, fetchFolders, fetchTree]);

  return { folders, tree, loading, createFolder, deleteFolder, refresh: fetchTree };
}
