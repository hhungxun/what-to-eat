import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

function adminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function isAdmin(req: Request) {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(/wte-admin=([^;]+)/);
  return match?.[1] === process.env.ADMIN_SECRET;
}

export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = adminClient();
  const { data, error } = await supabase.from("restaurants").select("*").order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ restaurants: data });
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const supabase = adminClient();

  const { data, error } = await supabase
    .from("restaurants")
    .insert(body)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ restaurant: data }, { status: 201 });
}
