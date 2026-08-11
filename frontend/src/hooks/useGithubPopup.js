import { useEffect } from "react";

export function useGithubPopup() {
  useEffect(() => {
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
