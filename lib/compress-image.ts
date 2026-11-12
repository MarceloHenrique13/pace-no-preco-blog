const MAX_EDGE = 1200;
const JPEG_QUALITY = 0.82;

export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("not_an_image");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("canvas_unavailable");
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const preferWebp = file.type === "image/webp" || file.type === "image/png";
  const mime = preferWebp ? "image/webp" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mime, JPEG_QUALITY),
  );

  if (!blob) {
    throw new Error("compress_failed");
  }

  const base = file.name.replace(/\.[^.]+$/, "") || "shoe";
  const ext = mime === "image/webp" ? "webp" : "jpg";
  return new File([blob], `${base}.${ext}`, { type: mime });
}
