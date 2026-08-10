import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const dismissedAt = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissedAt) {
      const daysSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        setDismissed(true);
        return;
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 lg:left-auto lg:right-4 lg:w-80">
      <div className="bg-card border rounded-xl shadow-lg p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Download className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Instalar Knowledge</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Adicione à tela inicial para acesso rápido, mesmo offline.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Button size="sm" className="h-8" onClick={handleInstall}>
              Instalar
            </Button>
            <Button size="sm" variant="ghost" className="h-8" onClick={handleDismiss}>
              Agora não
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded hover:bg-accent shrink-0"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}