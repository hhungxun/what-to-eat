import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { isAdminRequest } from "@/lib/admin-auth";

export async function POST(req: Request) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabase.storage.createBucket("restaurant-images", { public: true }).catch(() => {});

  const ext = file.name.split(".").pop() ?? "jpg";
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from("restaurant-images")
    .upload(fileName, bytes, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage
    .from("restaurant-images")
    .getPublicUrl(fileName);

  return NextResponse.json({ url: publicUrl });
}
