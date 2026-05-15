export function getAdminSecrets(): string[] {
  return [process.env.ADMIN_SECRETS, process.env.ADMIN_SECRET]
    .filter(Boolean)
    .join(",")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isAdminSecret(value: string | undefined | null): boolean {
  if (!value) return false;
  return getAdminSecrets().includes(value);
}

export function getAdminCookieFromHeader(cookieHeader: string | null): string | null {
  const match = (cookieHeader ?? "").match(/(?:^|;\s*)wte-admin=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function isAdminRequest(req: Request): boolean {
  return isAdminSecret(getAdminCookieFromHeader(req.headers.get("cookie")));
}
