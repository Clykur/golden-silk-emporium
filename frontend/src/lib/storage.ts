import { supabase } from "./supabase";

const BUCKET_PRODUCTS = "product-images";
const BUCKET_COLLECTIONS = "collection-images";
const BUCKET_BANNERS = "banner-images";

function generatePath(folder: string, filename: string) {
  const ext = filename.split(".").pop();
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${folder}/${unique}.${ext}`;
}

export async function uploadProductImage(
  file: File,
  productId: string
): Promise<string> {
  const path = generatePath(productId, file.name);
  const { error } = await supabase.storage
    .from(BUCKET_PRODUCTS)
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET_PRODUCTS).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadCollectionImage(file: File, collectionId: string): Promise<string> {
  const path = generatePath(collectionId, file.name);
  const { error } = await supabase.storage
    .from(BUCKET_COLLECTIONS)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET_COLLECTIONS).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadBannerImage(file: File): Promise<string> {
  const path = generatePath("banners", file.name);
  const { error } = await supabase.storage
    .from(BUCKET_BANNERS)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET_BANNERS).getPublicUrl(path);
  return data.publicUrl;
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
  onProgress?: (index: number, total: number) => void
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
