import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function ExportButton() {
  const { token } = useAuth();

  const handleExport = async () => {
    const res = await fetch(`${API_URL}/export/markdown`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "knowledge-backup.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleExport} className="h-9 w-9" title="Exportar backup">
      <Download className="h-4 w-4" />
      <span className="sr-only">Exportar</span>
    </Button>
  );
}
