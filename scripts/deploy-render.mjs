const hook = process.env.RENDER_DEPLOY_HOOK_URL;
const origin = process.env.API_BASE_URL;
const sha = process.env.GITHUB_SHA;
if (!hook || !origin || !sha) {
  throw new Error("Missing Render deployment settings.");
}
const url = new URL(hook);
url.searchParams.set("ref", sha);
try {
  const response = await fetch(url, {
    method: "POST",
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error("Deploy request rejected.");
} catch {
  // Never log the private hook URL or a fetch error containing it.
  console.error("Render could not accept the deploy request. Check its dashboard and the repository secret.");
  process.exit(1);
}
console.log(`Render accepted deployment of ${sha.slice(0, 7)}. Waiting for the new version.`);
const deadline = Date.now() + 12 * 60 * 1000;
while (Date.now() < deadline) {
  await new Promise((resolve) => setTimeout(resolve, 15000));
  try {
    const response = await fetch(new URL("/api/health", origin), {
      signal: AbortSignal.timeout(10000),
      headers: { "Cache-Control": "no-cache" },
    });
    const health = await response.json();
    if (response.ok && health.ok && health.version === sha) {
      console.log("The new server version is live and healthy.");
      process.exit(0);
    }
  } catch {
    // Brief unavailability can occur while the container starts.
  }
}
console.error("The requested server version did not become healthy within 12 minutes. Check Render deploy logs.");
process.exit(1);
