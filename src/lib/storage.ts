import { supabase } from "@/integrations/supabase/client";
import { processImageFile } from "./image-processing";

export type BucketName = "produtos" | "categorias" | "clientes" | "fornecedores";

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(",");
  const mime = /:(.*?);/.exec(meta)?.[1] ?? "image/jpeg";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/** Comprime a imagem no browser e envia ao bucket, devolvendo a URL pública. */
export async function uploadImage(bucket: BucketName, file: File): Promise<string> {
  const dataUrl = await processImageFile(file, { maxDim: 1200, quality: 0.78 });
  const blob = dataUrlToBlob(dataUrl);
  const path = `${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType: "image/jpeg",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function uploadImages(bucket: BucketName, files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const f of files) urls.push(await uploadImage(bucket, f));
  return urls;
}
