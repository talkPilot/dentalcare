# GitHub Pages + secure API

Frontend domain: https://dental-care24.com
Repository: https://github.com/talkPilot/dentalcare

GitHub Actions builds and publishes `dist/` from `main`. The Pages artifact contains no server source or environment files. `scripts/build-pages.mjs` emits individual entry pages so direct treatment links and page refreshes work on static hosting.

The same workflow deploys the API after tests and the build pass. Store the service's existing Render deploy hook in repository secret `RENDER_DEPLOY_HOOK_URL`. It sends the exact Git commit to Render and waits for `/api/health` to report that commit before marking the backend job successful. Configure Render's native Auto-Deploy as Off to avoid duplicate deployments; GitHub Actions owns the trigger. This works with the public Git repository without granting Render access to other repositories.

The API is deployed separately. Set the repository **variable** `API_BASE_URL` to its HTTPS origin (for example, the eventual `https://api.dental-care24.com`) and rerun the Pages workflow. This variable is a public URL, never an API key.

Current backend: `https://dentalcare-api-h0no.onrender.com` (Render service `dentalcare-api`, Frankfurt, 512 MB). The GitHub `API_BASE_URL` variable points to this origin. The selected compute costs $7/month before taxes and usage charges. Initial configuration processes one smile job at a time and caps generation at 30 images per day per process.

The server uses private OpenAI and Resend keys in Render environment settings. Resend is scoped to sending from the verified `dental-care24.com` domain; the sender is `Dental Care 24 <hello@dental-care24.com>`. The operator explicitly chose to launch without Turnstile: `ALLOW_WITHOUT_TURNSTILE=true`. Origin checks, honeypot, rate limits and image quotas remain in place. To enable Turnstile later, add both keys and remove that opt-out.

Only the four GitHub Pages A records at `@` and the `www` CNAME need changing in GoDaddy. Preserve nameservers, `_domainconnect`, and mail records. GitHub Pages cannot execute the Express server or safely hold an OpenAI key in frontend JavaScript.

## Backend deployment

The included Dockerfile runs as a non-root user and excludes local environment files from the build context. It supports a Node/container host such as Render or Railway. A native Node deployment can instead use `npm ci && npm run build` as its build command and `npm start` as its start command. Set `HOST=0.0.0.0`; use the hosting provider's `PORT`. Health-check path: `/api/health`.

Add credentials through the hosting provider's private environment settings. Do not put them in repository variables, build arguments, client code, or DNS records. Use `PUBLIC_ORIGIN=https://dental-care24.com` and `ALLOWED_ORIGINS=https://dental-care24.com,https://www.dental-care24.com`. Configure the verified mail sender and anti-bot keys as described in README.md. Retain one server instance until rate limits and job state have shared storage.

Image requests can take several minutes and upload up to 30 MB, so confirm the selected host's request limits before deployment. The current synchronous endpoint is unsuitable for a host with a 4.5 MB request/response limit. A sleeping free instance is not recommended for a production clinic.

Once deployed, verify `/api/health` and `/api/config`, set GitHub repository variable `API_BASE_URL` to the backend HTTPS origin, and rerun the Pages workflow. Verify a real consented image submission and delivery to the clinic before announcing the AI feature as live.
