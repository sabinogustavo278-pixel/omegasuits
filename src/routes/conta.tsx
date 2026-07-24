import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { UserCircle2, Upload, Trash2, KeyRound, Check } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { processImageFile } from "@/lib/image-processing";
import {
  clearAvatar,
  getPassword,
  setAvatar,
  setPassword,
  useAvatar,
} from "@/lib/mock-account";

export const Route = createFileRoute("/conta")({
  head: () => ({
    meta: [
      { title: "Minha conta — Omega Admin" },
      { name: "description", content: "Preferências da conta Omega Suits." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ContaPage,
});

function ContaPage() {
  const avatar = useAvatar();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwMsg, setPwMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg(null);
    try {
      const dataUrl = await processImageFile(file, { maxDim: 400, quality: 0.8 });
      setAvatar(dataUrl);
      setUploadMsg("Avatar atualizado e otimizado com sucesso.");
    } catch (err) {
      setUploadMsg((err as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    const current = getPassword();
    if (pwCurrent !== current) {
      setPwMsg({ tone: "err", text: "Senha atual incorreta." });
      return;
    }
    if (pwNew.length < 4) {
      setPwMsg({ tone: "err", text: "A nova senha deve ter ao menos 4 caracteres." });
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwMsg({ tone: "err", text: "As senhas não coincidem." });
      return;
    }
    setPassword(pwNew);
    setPwCurrent("");
    setPwNew("");
    setPwConfirm("");
    setPwMsg({ tone: "ok", text: "Senha atualizada com sucesso." });
  }

  return (
    <AdminShell eyebrow="Perfil" title="Minha conta">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Avatar */}
        <section className="border border-border bg-background p-8">
          <p className="text-[10px] uppercase tracking-[0.32em] text-accent">Avatar</p>
          <h2 className="mt-2 font-serif text-2xl text-foreground">Foto de perfil</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A imagem é redimensionada para 400px e comprimida em JPEG antes do armazenamento.
          </p>

          <div className="mt-8 flex items-center gap-6">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary/40">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <UserCircle2 className="h-16 w-16 text-muted-foreground" strokeWidth={1} />
              )}
            </div>
            <div className="flex flex-col gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 border border-foreground bg-foreground px-5 py-3 text-[11px] uppercase tracking-[0.28em] text-background transition-colors hover:bg-transparent hover:text-foreground disabled:opacity-60"
              >
                <Upload className="h-4 w-4" strokeWidth={1.5} />
                {uploading ? "Enviando…" : "Enviar imagem"}
              </button>
              {avatar ? (
                <button
                  type="button"
                  onClick={() => clearAvatar()}
                  className="inline-flex items-center gap-2 border border-border bg-background px-5 py-3 text-[11px] uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.25} />
                  Remover
                </button>
              ) : null}
            </div>
          </div>

          {uploadMsg ? (
            <p className="mt-6 border border-accent/30 bg-accent/5 px-4 py-3 text-xs text-foreground">
              {uploadMsg}
            </p>
          ) : null}
        </section>

        {/* Password */}
        <section className="border border-border bg-background p-8">
          <p className="text-[10px] uppercase tracking-[0.32em] text-accent">Segurança</p>
          <h2 className="mt-2 font-serif text-2xl text-foreground">Alterar senha</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Mínimo de 4 caracteres. A alteração é aplicada imediatamente.
          </p>

          <form onSubmit={handlePassword} className="mt-8 space-y-4">
            <Field label="Senha atual">
              <input
                type="password"
                value={pwCurrent}
                onChange={(e) => setPwCurrent(e.target.value)}
                className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground"
                autoComplete="current-password"
              />
            </Field>
            <Field label="Nova senha">
              <input
                type="password"
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
                className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground"
                autoComplete="new-password"
              />
            </Field>
            <Field label="Confirmar nova senha">
              <input
                type="password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground"
                autoComplete="new-password"
              />
            </Field>

            {pwMsg ? (
              <p
                className={`flex items-center gap-2 border px-4 py-3 text-xs ${
                  pwMsg.tone === "ok"
                    ? "border-emerald-600/30 bg-emerald-500/10 text-emerald-700"
                    : "border-red-600/30 bg-red-500/10 text-red-700"
                }`}
              >
                {pwMsg.tone === "ok" ? <Check className="h-4 w-4" /> : null}
                {pwMsg.text}
              </p>
            ) : null}

            <button
              type="submit"
              className="inline-flex items-center gap-2 border border-foreground bg-foreground px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-background transition-colors hover:bg-transparent hover:text-foreground"
            >
              <KeyRound className="h-4 w-4" strokeWidth={1.5} />
              Atualizar senha
            </button>
          </form>
        </section>
      </div>
    </AdminShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
