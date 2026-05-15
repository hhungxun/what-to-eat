import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { isAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

const BUCKET = "restaurant-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (fromName) return fromName;
  return file.type.split("/")[1] ?? "jpg";
}

async function ensureBucket(supabase: ReturnType<typeof createClient<Database>>) {
  const { data: bucket, error: getError } = await supabase.storage.getBucket(BUCKET);
  if (bucket) {
    if (!bucket.public) {
      const { error } = await supabase.storage.updateBucket(BUCKET, { public: true });
      if (error) return error;
    }
    return null;
  }

  if (getError && !getError.message.toLowerCase().includes("not found")) {
    return getError;
  }

  const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
  return error ?? null;
}

export async function POST(req: Request) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Image upload is not configured" }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json({ error: "Image must be 5 MB or smaller" }, { status: 400 });
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

  const bucketError = await ensureBucket(supabase);
  if (bucketError) {
    console.error("[upload-image] bucket error:", bucketError);
    return NextResponse.json({ error: `Storage bucket error: ${bucketError.message}` }, { status: 500 });
  }

  const ext = extensionFor(file);
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, bytes, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    console.error("[upload-image] upload error:", error);
    return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(fileName);

  return NextResponse.json({ url: publicUrl });
}
