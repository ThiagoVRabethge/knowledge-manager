import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "@/contexts/AuthContext";
import App from "./App";
import "./index.css";

// === Handler de popup para sync com GitHub ===
const params = new URLSearchParams(window.location.search);
if (window.opener && params.get("state") === "knowledge-sync" && params.get("code")) {
  window.opener.postMessage(
    { type: "GITHUB_SYNC_CODE", code: params.get("code") },
    "*"
  );
  window.close();
}
// =============================================

// === Registro do Service Worker (PWA) ===
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered:", registration.scope);
      })
      .catch((error) => {
        console.log("SW registration failed:", error);
      });
  });
}
// =========================================

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);