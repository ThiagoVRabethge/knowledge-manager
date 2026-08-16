import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import App from "./App";
import "./index.css";

const params = new URLSearchParams(window.location.search);
if (window.opener && params.get("state") === "knowledge-sync" && params.get("code")) {
  window.opener.postMessage(
    { type: "GITHUB_SYNC_CODE", code: params.get("code") },
    "*"
  );
  window.close();
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    if (import.meta.env.DEV) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => {
          reg.unregister();
          console.log("SW unregistered (dev mode)");
        });
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      });
      return;
    }

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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
