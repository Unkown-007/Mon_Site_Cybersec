/*
 * Redimensionne une image (File) en petite vignette carrée (data URL JPEG),
 * côté client, pour l'avatar — évite tout stockage de fichier serveur.
 */
export async function fileToAvatar(file: File, size = 160): Promise<string> {
  const bmp = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas indisponible");
  const scale = Math.max(size / bmp.width, size / bmp.height);
  const w = bmp.width * scale;
  const h = bmp.height * scale;
  ctx.drawImage(bmp, (size - w) / 2, (size - h) / 2, w, h);
  bmp.close?.();
  return canvas.toDataURL("image/jpeg", 0.82);
}
