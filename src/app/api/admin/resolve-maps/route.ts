import { NextResponse } from "next/server";

function isAdmin(req: Request) {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(/wte-admin=([^;]+)/);
  const value = match?.[1];
  if (!value) return false;
  const secrets = (process.env.ADMIN_SECRETS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return secrets.includes(value);
}

/** Extract place name from any Google Maps URL format */
function parseNameFromUrl(rawUrl: string): string | null {
  try {
    // Decode percent-encoding first, but handle malformed URLs gracefully
    let url = rawUrl;
    try { url = decodeURIComponent(rawUrl); } catch { /* leave as-is */ }

    // /maps/place/Name/@lat  or  /maps/place/Name/data=
    const placeMatch = url.match(/\/maps\/place\/([^/@?&#\n]+)/);
    if (placeMatch) {
      return placeMatch[1].replace(/\+/g, " ").trim() || null;
    }

    // /maps/search/Name/
    const searchMatch = url.match(/\/maps\/search\/([^/@?&#\n]+)/);
    if (searchMatch) {
      return searchMatch[1].replace(/\+/g, " ").trim() || null;
    }

    // ?q=Name  or  &q=Name
    const qMatch = url.match(/[?&]q=([^&#\n]+)/);
    if (qMatch) {
      return qMatch[1].replace(/\+/g, " ").trim() || null;
    }

    return null;
  } catch {
    return null;
  }
}

/** Extract name from the <title> of a Google Maps HTML page */
function parseNameFromHtml(html: string): string | null {
  // og:title is the most reliable — Google Maps sets it to the place name
  const ogMatch = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)
    ?? html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:title"/i);
  if (ogMatch) {
    return ogMatch[1].replace(/ [-–|] Google Maps$/, "").trim() || null;
  }

  // Fall back to <title>
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    return titleMatch[1].replace(/ [-–|] Google Maps$/, "").replace(/ [-–|] Maps$/, "").trim() || null;
  }

  return null;
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url } = await req.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  // Try parsing the URL directly first (works for long google.com/maps/place URLs)
  const direct = parseNameFromUrl(url);
  if (direct) return NextResponse.json({ name: direct });

  // For short URLs (maps.app.goo.gl, goo.gl, etc.) — follow redirects with GET
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        // Use a browser-like UA so Google doesn't serve a stripped response
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(8000),
    });

    // 1. The final URL after redirects often contains the place name
    const finalUrl = res.url;
    if (finalUrl && finalUrl !== url) {
      const fromUrl = parseNameFromUrl(finalUrl);
      if (fromUrl) return NextResponse.json({ name: fromUrl, resolved_url: finalUrl });
    }

    // 2. Read the first 8 KB of HTML — enough to get <head> with og:title
    const reader = res.body?.getReader();
    if (reader) {
      let html = "";
      let done = false;
      while (!done && html.length < 8192) {
        const chunk = await reader.read();
        done = chunk.done;
        if (chunk.value) html += new TextDecoder().decode(chunk.value);
      }
      reader.cancel();

      const fromHtml = parseNameFromHtml(html);
      if (fromHtml) return NextResponse.json({ name: fromHtml, resolved_url: finalUrl });
    }

  } catch (err) {
    console.error("[resolve-maps] fetch error:", err);
  }

  return NextResponse.json({ name: null });
}
