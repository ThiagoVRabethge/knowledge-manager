import { API_URL, authFetch } from "@/lib/utils";

export function useGithubSync() {
  const syncUpload = async (accessToken) => {
    const res = await authFetch(`${API_URL}/sync/github`, {
      method: "POST",
      body: JSON.stringify({ access_token: accessToken }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Sync failed");
    }
    return res.json();
  };

  const getStatus = async (accessToken) => {
    const res = await authFetch(
      `${API_URL}/sync/github/status?access_token=${encodeURIComponent(accessToken)}`
    );
    if (!res.ok) throw new Error("Failed to get status");
    return res.json();
  };

  return { syncUpload, getStatus };
}