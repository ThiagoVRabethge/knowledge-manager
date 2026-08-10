import { useState, useEffect, useCallback } from "react";
import { Github, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/utils";

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || "";

export function GithubSyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const performSync = useCallback(async (code: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/sync/github`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Sync failed");
      }
      const result = await res.json();
      if (result.ok) {
        setLastSync(new Date().toLocaleTimeString("pt-BR"));
      }
    } catch (e: any) {
      alert(e.message || "Erro ao sincronizar com GitHub");
    } finally {
      setSyncing(false);
    }
  }, []);

  const handleSync = useCallback(() => {
    if (!GITHUB_CLIENT_ID || syncing) return;

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: window.location.origin,
      scope: "repo user:email",
      state: "knowledge-sync",
    });

    const popup = window.open(
      `https://github.com/login/oauth/authorize?${params.toString()}`,
      "github-oauth-sync",
      `width=${width},height=${height},left=${left},top=${top},popup=1`
    );

    if (!popup) {
      alert("Permita popups para sincronizar com GitHub");
      return;
    }

    setSyncing(true);

    const handler = (event: MessageEvent) => {
      if (event.data?.type === "GITHUB_SYNC_CODE" && event.data.code) {
        window.removeEventListener("message", handler);
        performSync(event.data.code);
      }
    };

    window.addEventListener("message", handler);

    // Fallback: se o popup for fechado manualmente sem enviar code
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", handler);
        setSyncing(false);
      }
    }, 1000);
  }, [syncing, performSync]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleSync}
      disabled={!GITHUB_CLIENT_ID || syncing}
      className="h-9 w-9"
      title={lastSync ? `Último sync: ${lastSync}` : "Sincronizar com GitHub"}
    >
      {syncing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : lastSync ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <Github className="h-4 w-4" />
      )}
      <span className="sr-only">Sync GitHub</span>
    </Button>
  );
}