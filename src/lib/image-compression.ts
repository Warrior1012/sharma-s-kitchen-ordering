const MAX_INPUT_BYTES = 2 * 1024 * 1024;
const MAX_DIMENSION = 1200;

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read the selected image."));
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(blob);
  });
}

/** Compress an admin-selected JPG/PNG/WebP image before saving it in local demo storage. */
export async function compressDemoImage(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Choose a JPG, PNG or WebP image.");
  if (file.size > MAX_INPUT_BYTES) throw new Error("Image must be 2 MB or smaller.");

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser cannot process the selected image.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.78, 0.64, 0.5, 0.38]) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
      if (blob && blob.size <= 350_000) return await toDataUrl(blob);
    }
    throw new Error("Image could not be compressed enough. Choose a smaller image.");
  } finally {
    bitmap.close();
  }
}
