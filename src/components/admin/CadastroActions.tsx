import { Download, Upload, Plus } from "lucide-react";

export interface CadastroActionsProps {
  entity: string; // "Fornecedor", "Produto", etc.
  templateName?: string; // csv filename
  templateColumns?: string[];
  onNew?: () => void;
  onImport?: () => void;
  onTemplate?: () => void;
}

function downloadCsv(name: string, columns: string[]) {
  const header = columns.join(",");
  const blob = new Blob([header + "\n"], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function CadastroActions({
  entity,
  templateName = "template.csv",
  templateColumns = ["id", "nome"],
  onNew,
  onImport,
  onTemplate,
}: CadastroActionsProps) {
  const handleTemplate = () => {
    if (onTemplate) return onTemplate();
    downloadCsv(templateName, templateColumns);
  };
  const handleImport = () => {
    if (onImport) return onImport();
    alert(`Importar ${entity.toLowerCase()} — selecione um arquivo .csv (mock).`);
  };
  const handleNew = () => {
    if (onNew) return onNew();
    alert(`Novo ${entity} (mock).`);
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <button
        onClick={handleTemplate}
        className="inline-flex items-center gap-2 border border-border bg-background px-5 py-3 text-[11px] uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
      >
        <Download className="h-4 w-4" strokeWidth={1.25} />
        Template
      </button>
      <button
        onClick={handleImport}
        className="inline-flex items-center gap-2 border border-border bg-background px-5 py-3 text-[11px] uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
      >
        <Upload className="h-4 w-4" strokeWidth={1.25} />
        Importar
      </button>
      <button
        onClick={handleNew}
        className="inline-flex items-center gap-2 border border-foreground bg-foreground px-5 py-3 text-[11px] uppercase tracking-[0.28em] text-background transition-colors hover:bg-transparent hover:text-foreground"
      >
        <Plus className="h-4 w-4" strokeWidth={1.5} />
        Novo {entity}
      </button>
    </div>
  );
}
