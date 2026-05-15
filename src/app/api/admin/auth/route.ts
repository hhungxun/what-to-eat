import { NextResponse } from "next/server";
import { getAdminSecrets } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const { password } = await req.json();

  const allowed = getAdminSecrets();
  if (!allowed.includes(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("wte-admin", password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("wte-admin");
  return res;
}
