import { Download, Upload, Plus, X, ImagePlus } from "lucide-react";
import { useRef, useState } from "react";
import { processImageFile } from "@/lib/image-processing";

export interface CadastroActionsProps {
  entity: string; // "Fornecedor", "Produto", etc.
  templateName?: string; // csv filename
  templateColumns?: string[];
  onNew?: () => void;
  onImport?: () => void;
  onTemplate?: () => void;
  /** Campos exibidos no formulário padrão "Novo". */
  formFields?: Array<{ name: string; label: string; type?: "text" | "email" | "tel" | "textarea" }>;
  /** Exibir upload de imagem no formulário "Novo". */
  withImage?: boolean;
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

const DEFAULT_FIELDS = [
  { name: "nome", label: "Nome" },
  { name: "descricao", label: "Descrição", type: "textarea" as const },
];

export function CadastroActions({
  entity,
  templateName = "template.csv",
  templateColumns = ["id", "nome"],
  onNew,
  onImport,
  onTemplate,
  formFields = DEFAULT_FIELDS,
  withImage = true,
}: CadastroActionsProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [imgError, setImgError] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const handleTemplate = () => {
    if (onTemplate) return onTemplate();
    downloadCsv(templateName, templateColumns);
  };
  const handleImport = () => {
    if (onImport) return onImport();
    importInputRef.current?.click();
  };
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    alert(`Arquivo "${f.name}" recebido. Importação de ${entity.toLowerCase()}s simulada (mock).`);
    e.target.value = "";
  };
  const handleNew = () => {
    if (onNew) return onNew();
    setOpen(true);
  };
  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImgError(null);
    try {
      const dataUrl = await processImageFile(f, { maxDim: 900, quality: 0.8 });
      setPreview(dataUrl);
    } catch (err) {
      setImgError(err instanceof Error ? err.message : "Falha ao processar imagem.");
    }
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      setOpen(false);
      setPreview(null);
      alert(`${entity} cadastrado(a) com sucesso (mock).`);
    }, 500);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <input
          ref={importInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleImportFile}
        />
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

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={submit}
            className="w-full max-w-2xl border border-border bg-background p-8 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between border-b border-border pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-accent">Novo cadastro</p>
                <h2 className="mt-1 font-serif text-2xl text-foreground">Novo {entity}</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {withImage ? (
                <div className="md:col-span-2">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                    Imagem
                  </p>
                  <label className="flex cursor-pointer items-center gap-4 border border-dashed border-border bg-secondary/40 p-4 transition-colors hover:border-foreground">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Prévia"
                        className="h-20 w-20 object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center bg-background text-muted-foreground">
                        <ImagePlus className="h-6 w-6" strokeWidth={1.25} />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-foreground">
                        {preview ? "Trocar imagem" : "Selecionar imagem"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Redimensionada e comprimida antes do envio ao bucket.
                      </p>
                      {imgError ? (
                        <p className="mt-1 text-xs text-red-600">{imgError}</p>
                      ) : null}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImage}
                    />
                  </label>
                </div>
              ) : null}

              {formFields.map((f) => (
                <div
                  key={f.name}
                  className={f.type === "textarea" ? "md:col-span-2" : "md:col-span-1"}
                >
                  <label
                    htmlFor={`novo-${f.name}`}
                    className="mb-2 block text-[10px] uppercase tracking-[0.32em] text-muted-foreground"
                  >
                    {f.label}
                  </label>
                  {f.type === "textarea" ? (
                    <textarea
                      id={`novo-${f.name}`}
                      rows={3}
                      className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground"
                    />
                  ) : (
                    <input
                      id={`novo-${f.name}`}
                      type={f.type ?? "text"}
                      className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-end gap-3 border-t border-border pt-5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="border border-border bg-background px-5 py-3 text-[11px] uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="border border-foreground bg-foreground px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-background transition-colors hover:bg-transparent hover:text-foreground disabled:opacity-60"
              >
                {saving ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
