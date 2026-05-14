import { NextResponse } from "next/server";

function isAdmin(req: Request) {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(/wte-admin=([^;]+)/);
  const value = match?.[1];
  if (!value) return false;
  const secrets = (process.env.ADMIN_SECRETS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return secrets.includes(value);
}

function parseNameFromUrl(url: string): string | null {
  try {
    const decoded = decodeURIComponent(url);
    const placeMatch = decoded.match(/\/maps\/place\/([^/@?#]+)/);
    if (placeMatch) return placeMatch[1].replace(/\+/g, " ").trim();

    const searchMatch = decoded.match(/\/maps\/search\/([^/@?#]+)/);
    if (searchMatch) return searchMatch[1].replace(/\+/g, " ").trim();

    const qMatch = decoded.match(/[?&]q=([^&#]+)/);
    if (qMatch) return qMatch[1].replace(/\+/g, " ").trim();

    return null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url } = await req.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  // Try direct parse first
  const direct = parseNameFromUrl(url);
  if (direct) return NextResponse.json({ name: direct });

  // Follow redirect for short URLs (maps.app.goo.gl, goo.gl, etc.)
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(5000),
    });
    const finalUrl = res.url;
    if (finalUrl && finalUrl !== url) {
      const name = parseNameFromUrl(finalUrl);
      return NextResponse.json({ name: name ?? null, resolved_url: finalUrl });
    }
  } catch {
    // timeout or network error — just return null
  }

  return NextResponse.json({ name: null });
}
