import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { API_URL } from "@/lib/utils";

export function AIGenerateDialog({ context, onInsert }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/ai/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ prompt, context }),
      });
      if (!res.ok) throw new Error("Falha na geração");
      const data = await res.json();
      setResult(data.text);
    } catch (e) {
      setResult("Erro ao gerar texto. Verifique se a chave Gemini está configurada no backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    onInsert(result);
    setOpen(false);
    setPrompt("");
    setResult("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">IA</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Gerar com IA</DialogTitle>
          <DialogDescription>
            Descreva o que você quer que a IA escreva para esta nota.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 overflow-hidden flex-1">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Escreva um resumo sobre..."
            className="w-full h-20 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button onClick={handleGenerate} disabled={loading || !prompt.trim()}>
            {loading ? "Gerando..." : "Gerar"}
          </Button>
          {result && (
            <div className="border rounded-md p-3 bg-muted/50 overflow-y-auto max-h-[200px]">
              <pre className="text-xs whitespace-pre-wrap font-mono">{result}</pre>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleInsert} disabled={!result}>Inserir na nota</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
