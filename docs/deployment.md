# GitHub Pages + secure API

Frontend domain: https://dental-care24.com
Repository: https://github.com/talkPilot/dentalcare

GitHub Actions builds and publishes `dist/` from `main`. The Pages artifact contains no server source or environment files. `scripts/build-pages.mjs` emits individual entry pages so direct treatment links and page refreshes work on static hosting.

The API is deployed separately. Set the repository **variable** `API_BASE_URL` to its HTTPS origin (for example, the eventual `https://api.dental-care24.com`) and rerun the Pages workflow. This variable is a public URL, never an API key.

The server needs the private `OPENAI_API_KEY`, mail provider settings, allowed frontend origins, and production anti-bot settings documented in README.md. The OpenAI key is currently configured only in ignored local `.env`; it must be added to the selected backend's secret store before activating the live service.

Only the four GitHub Pages A records at `@` and the `www` CNAME need changing in GoDaddy. Preserve nameservers, `_domainconnect`, and mail records. GitHub Pages cannot execute the Express server or safely hold an OpenAI key in frontend JavaScript.
