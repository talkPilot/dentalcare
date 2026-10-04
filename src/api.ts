// Public endpoint only. Credentials must never use a VITE_ prefix.
const origin = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
export const apiAvailable =
  Boolean(origin) || import.meta.env.VITE_STATIC_HOSTING !== "true";
export const apiUrl = (path: string) => `${origin}${path}`;
