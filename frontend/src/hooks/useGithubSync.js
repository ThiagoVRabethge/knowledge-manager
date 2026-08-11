import { API_URL } from "@/lib/utils";

export function useGithubSync() {
  const syncUpload = async (accessToken) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/sync/github`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ access_token: accessToken }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Sync failed");
    }
    return res.json();
  };

  const getStatus = async (accessToken) => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${API_URL}/sync/github/status?access_token=${encodeURIComponent(accessToken)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error("Failed to get status");
    return res.json();
  };

  return { syncUpload, getStatus };
}
