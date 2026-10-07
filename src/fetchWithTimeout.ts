/** AbortSignal.timeout is absent in Safari before 16; AbortController is supported. */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number,
) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}
