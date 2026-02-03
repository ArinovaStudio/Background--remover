import fs from "fs/promises";
import path from "path";

export async function uploadFile(file: File, folder: string) {
  if (!file) throw new Error("No file provided");

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
  const filename = `${timestamp}_${safeName}`;
  
  const finalPath = path.join(uploadDir, filename);

  await fs.writeFile(finalPath, buffer);

  return {
    url: `/uploads/${folder}/${filename}`, 
    filePath: finalPath
  };
}

export async function deleteFile(fileUrl: string) {
  try {
    const relativePath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
    const fullPath = path.join(process.cwd(), "public", relativePath);

    await fs.unlink(fullPath);
    return true;
  } catch {
    return false;
  }
}