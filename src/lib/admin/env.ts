export function adminEmailAllowlist() {
  return new Set(
    (process.env.ADMIN_EMAIL_ALLOWLIST ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAllowedAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  const allowlist = adminEmailAllowlist();
  return allowlist.has(email.trim().toLowerCase());
}

export function isAdminAuthConfigured() {
  let authOrigin: string | null = null;
  try {
    const configuredUrl =
      process.env.AUTH_URL ??
      (process.env.NODE_ENV === "production" ? "https://ionowu.com" : null);
    authOrigin = configuredUrl
      ? new URL(configuredUrl).origin
      : null;
  } catch {
    authOrigin = null;
  }

  return Boolean(
    authOrigin &&
      process.env.AUTH_SECRET &&
      process.env.AUTH_GOOGLE_ID &&
      process.env.AUTH_GOOGLE_SECRET &&
      process.env.ADMIN_EMAIL_ALLOWLIST &&
      process.env.DATABASE_URL,
  );
}
