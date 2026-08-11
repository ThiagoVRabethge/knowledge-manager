import { useState, useCallback } from "react";

const GITHUB_CLIENT_ID = import.meta.env?.VITE_GITHUB_CLIENT_ID || "";
const REDIRECT_URI = window.location.origin;

export function useGithubAuth() {
  const [ready] = useState(!!GITHUB_CLIENT_ID);

  const redirectToGithub = useCallback(() => {
    if (!GITHUB_CLIENT_ID) return;
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: "repo user:email",
      state: "knowledge-auth",
    });
    window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
  }, []);

  const getCodeFromUrl = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("code");
  }, []);

  const clearCodeFromUrl = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("code");
    url.searchParams.delete("state");
    window.history.replaceState({}, "", url.toString());
  }, []);

  return { ready, redirectToGithub, getCodeFromUrl, clearCodeFromUrl };
}
