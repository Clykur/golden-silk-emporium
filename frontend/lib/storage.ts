import { supabase } from "./supabase";

const BUCKET_PRODUCTS = "product-images";
const BUCKET_COLLECTIONS = "collection-images";
const BUCKET_BANNERS = "banner-images";

function generatePath(folder: string, filename: string) {
  const ext = filename.split(".").pop();
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${folder}/${unique}.${ext}`;
}

export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", productId);
  formData.append("bucket", BUCKET_PRODUCTS);

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Upload failed");
  }
  const { url } = await res.json();
  return url;
}

export async function uploadCollectionImage(file: File, collectionId: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", collectionId);
  formData.append("bucket", BUCKET_COLLECTIONS);

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Upload failed");
  }
  const { url } = await res.json();
  return url;
}

export async function uploadBannerImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "banners");
  formData.append("bucket", BUCKET_BANNERS);

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Upload failed");
  }
  const { url } = await res.json();
  return url;
}

export async function deleteStorageFile(bucket: string, path: string): Promise<void> {
  // Extract path from public URL
  const urlPath = path.split(`/storage/v1/object/public/${bucket}/`)[1];
  if (!urlPath) return;
  const { error } = await supabase.storage.from(bucket).remove([urlPath]);
  if (error) throw error;
}

export async function uploadMultipleProductImages(
  files: File[],
  productId: string,
  onProgress?: (index: number, total: number) => void,
): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const url = await uploadProductImage(files[i], productId);
    urls.push(url);
    onProgress?.(i + 1, files.length);
  }
  return urls;
}

export { BUCKET_PRODUCTS, BUCKET_COLLECTIONS, BUCKET_BANNERS };
