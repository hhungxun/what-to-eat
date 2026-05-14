import { NextResponse } from "next/server";

function getAllowedSecrets(): string[] {
  return (process.env.ADMIN_SECRETS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function POST(req: Request) {
  const { password } = await req.json();

  const allowed = getAllowedSecrets();
  if (!allowed.includes(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  // Store the password itself so the proxy can verify it's still in the allowed list
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
