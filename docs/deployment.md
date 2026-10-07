# Render production hosting

Domain: https://dental-care24.com
Repository: https://github.com/talkPilot/dentalcare
Managed HTTPS address: https://dentalcare-api-h0no.onrender.com

The frontend and API now run together on the existing Render service `dentalcare-api` (Frankfurt, 512 MB, $7/month before taxes and usage). The custom domain moved from GitHub Pages because certificate provisioning remained stuck. GitHub keeps the source and triggers deployment on every push to `main`; no new server subscription is required.

The workflow runs tests and the frontend build, sends the exact commit to Render using repository secret `RENDER_DEPLOY_HOOK_URL`, and waits until `/api/health` reports that commit. Repository variable `API_BASE_URL` holds the public managed Render origin for health checks. Render native Auto-Deploy stays Off to avoid duplicate runs. The Docker build serves the frontend and API from the same origin.

`scripts/build-pages.mjs` remains available for optional static exports but GitHub Pages is no longer a production deployment target. Initial configuration processes one smile job at a time and caps generation at 30 images per day per process.

The server uses private OpenAI and Resend keys in Render environment settings. Resend is scoped to sending from the verified `dental-care24.com` domain; the sender is `Dental Care 24 <hello@dental-care24.com>`. The operator explicitly chose to launch without Turnstile: `ALLOW_WITHOUT_TURNSTILE=true`. Origin checks, honeypot, rate limits and image quotas remain in place. To enable Turnstile later, add both keys and remove that opt-out.

Production DNS: one A record at `@` to `216.24.57.1`, and `www` CNAME to `dentalcare-api-h0no.onrender.com`. Render provisions TLS and redirects www to the root domain. Preserve nameservers, `_domainconnect`, and all Resend mail records.

## Backend deployment

The included Dockerfile runs as a non-root user and excludes local environment files from the build context. It supports a Node/container host such as Render or Railway. A native Node deployment can instead use `npm ci && npm run build` as its build command and `npm start` as its start command. Set `HOST=0.0.0.0`; use the hosting provider's `PORT`. Health-check path: `/api/health`.

Add credentials through the hosting provider's private environment settings. Do not put them in repository variables, build arguments, client code, or DNS records. Use `PUBLIC_ORIGIN=https://dental-care24.com` and `ALLOWED_ORIGINS=https://dental-care24.com,https://www.dental-care24.com`. Configure the verified mail sender and anti-bot keys as described in README.md. Retain one server instance until rate limits and job state have shared storage.

Image requests can take several minutes and upload up to 30 MB, so confirm the selected host's request limits before deployment. The current synchronous endpoint is unsuitable for a host with a 4.5 MB request/response limit. A sleeping free instance is not recommended for a production clinic.

After deployment, verify `/api/health`, `/api/config`, the custom-domain certificate, and direct treatment URLs. The managed Render URL is also accepted as an exact allowed origin, so forms work there during DNS propagation. Other Render sites remain blocked.
