import { useState, useEffect } from "react";
import { BookOpen, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGithubAuth } from "@/hooks/useGithubAuth";
import { useAuth } from "@/contexts/AuthContext";

export function LoginScreen() {
  const { login } = useAuth();
  const { ready, redirectToGithub, getCodeFromUrl, clearCodeFromUrl } = useGithubAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (window.opener) return;

    const code = getCodeFromUrl();
    if (!code) return;
    clearCodeFromUrl();
    setLoading(true);
    setError("");
    login(code)
      .catch((err) => setError(err.message || "Falha no login com GitHub"))
      .finally(() => setLoading(false));
  }, [getCodeFromUrl, clearCodeFromUrl, login]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Knowledge</h1>
          <p className="text-sm text-muted-foreground">Entre com sua conta GitHub</p>
        </div>

        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        <Button
          variant="outline"
          className="w-full h-11 gap-2"
          onClick={redirectToGithub}
          disabled={!ready || loading}
        >
          <Github className="h-4 w-4" />
          {loading ? "Carregando..." : "Entrar com GitHub"}
        </Button>
      </div>
    </div>
  );
}