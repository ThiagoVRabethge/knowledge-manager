import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "@/contexts/AuthContext";
import App from "./App";
import "./index.css";

// === Handler de popup para sync com GitHub ===
// Roda antes de tudo, independente de login, para capturar o code do popup
const params = new URLSearchParams(window.location.search);
if (window.opener && params.get("state") === "knowledge-sync" && params.get("code")) {
  window.opener.postMessage(
    { type: "GITHUB_SYNC_CODE", code: params.get("code") },
    "*"
  );
  window.close();
}
// =============================================

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);