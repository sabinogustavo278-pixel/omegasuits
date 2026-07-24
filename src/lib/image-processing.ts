// Client-side image processing: resize + JPEG compression.
// Result is a base64 data URL — mock stand-in for a bucket URL.

export interface ProcessImageOptions {
  maxDim?: number; // longest side in pixels
  quality?: number; // 0..1 for JPEG
}

export async function processImageFile(
  file: File,
  { maxDim = 800, quality = 0.8 }: ProcessImageOptions = {},
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Arquivo não é uma imagem.");
  }
  const dataUrl = await readAsDataUrl(file);
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível.");
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
