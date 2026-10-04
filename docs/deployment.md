# GitHub Pages + secure API

Frontend domain: https://dental-care24.com
Repository: https://github.com/talkPilot/dentalcare

GitHub Actions builds and publishes `dist/` from `main`. The Pages artifact contains no server source or environment files. `scripts/build-pages.mjs` emits individual entry pages so direct treatment links and page refreshes work on static hosting.

The API is deployed separately. Set the repository **variable** `API_BASE_URL` to its HTTPS origin (for example, the eventual `https://api.dental-care24.com`) and rerun the Pages workflow. This variable is a public URL, never an API key.

Current backend: `https://dentalcare-api-h0no.onrender.com` (Render service `dentalcare-api`, Frankfurt, 512 MB). The GitHub `API_BASE_URL` variable points to this origin. The selected compute costs $7/month before taxes and usage charges. Initial configuration processes one smile job at a time and caps generation at 30 images per day per process.

The server needs the private `OPENAI_API_KEY`, mail provider settings, allowed frontend origins, and production anti-bot settings documented in README.md. The OpenAI key has been entered into Render's private environment settings and is also in ignored local `.env`. The mail and anti-bot credentials must still be configured before the public forms become available.

Only the four GitHub Pages A records at `@` and the `www` CNAME need changing in GoDaddy. Preserve nameservers, `_domainconnect`, and mail records. GitHub Pages cannot execute the Express server or safely hold an OpenAI key in frontend JavaScript.

## Backend deployment

The included Dockerfile runs as a non-root user and excludes local environment files from the build context. It supports a Node/container host such as Render or Railway. A native Node deployment can instead use `npm ci && npm run build` as its build command and `npm start` as its start command. Set `HOST=0.0.0.0`; use the hosting provider's `PORT`. Health-check path: `/api/health`.

Add credentials through the hosting provider's private environment settings. Do not put them in repository variables, build arguments, client code, or DNS records. Use `PUBLIC_ORIGIN=https://dental-care24.com` and `ALLOWED_ORIGINS=https://dental-care24.com,https://www.dental-care24.com`. Configure the verified mail sender and anti-bot keys as described in README.md. Retain one server instance until rate limits and job state have shared storage.

Image requests can take several minutes and upload up to 30 MB, so confirm the selected host's request limits before deployment. The current synchronous endpoint is unsuitable for a host with a 4.5 MB request/response limit. A sleeping free instance is not recommended for a production clinic.

Once deployed, verify `/api/health` and `/api/config`, set GitHub repository variable `API_BASE_URL` to the backend HTTPS origin, and rerun the Pages workflow. Verify a real consented image submission and delivery to the clinic before announcing the AI feature as live.
