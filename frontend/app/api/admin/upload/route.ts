import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string;
    const bucket = formData.get("bucket") as string;

    if (!file || !folder || !bucket) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if bucket exists, if not try to create it automatically
    // The admin key can create buckets
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    if (!buckets?.some((b) => b.name === bucket)) {
      await supabaseAdmin.storage.createBucket(bucket, { public: true });
    }

    const ext = file.name.split(".").pop();
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const path = `${folder}/${unique}.${ext}`;

    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
