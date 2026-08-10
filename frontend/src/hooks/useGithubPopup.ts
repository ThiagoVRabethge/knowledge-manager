import { useEffect } from "react";

export function useGithubPopup() {
  useEffect(() => {
    // Se esta janela é um popup de sync, captura o code e envia de volta
    if (!window.opener) return;

    const params = new URLSearchParams(window.location.search);
    const state = params.get("state");
    const code = params.get("code");

    if (state === "knowledge-sync" && code) {
      window.opener.postMessage({ type: "GITHUB_SYNC_CODE", code }, "*");
      window.close();
    }
  }, []);
}