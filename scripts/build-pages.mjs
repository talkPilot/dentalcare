import { readFile, writeFile, mkdir } from "node:fs/promises";
const origin = "https://dental-care24.com";
const source = await readFile("dist/index.html", "utf8");
const routes = {
  "": "דנטל קר 24 — מקום לחיוך שלך",
  "treatments/veneers": "ציפויי שיניים | דנטל קר 24",
  "treatments/crowns": "כתרים ושיקום | דנטל קר 24",
  "treatments/implants": "השתלות שיניים | דנטל קר 24",
  "treatments/whitening": "הלבנת שיניים | דנטל קר 24",
  "treatments/alignment": "יישור שיניים | דנטל קר 24",
  privacy: "פרטיות | דנטל קר 24",
  accessibility: "נגישות | דנטל קר 24",
};
for (const [route, title] of Object.entries(routes)) {
  await mkdir(`dist/${route}`, { recursive: true });
  const canonical = `${origin}/${route}${route ? "/" : ""}`;
  const html = source
    .replace(/<title>.*?<\/title>/s, `<title>${title}</title>`)
    .replace(
      "</head>",
      `<link rel="canonical" href="${canonical}"/><meta property="og:url" content="${canonical}"/></head>`,
    );
  await writeFile(`dist/${route ? route + "/" : ""}index.html`, html);
}
await writeFile("dist/404.html", source);
await writeFile("dist/.nojekyll", "");
await writeFile("dist/CNAME", "dental-care24.com\n");
await writeFile(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(
    routes,
  )
    .map((r) => `<url><loc>${origin}/${r}${r ? "/" : ""}</loc></url>`)
    .join("")}</urlset>`,
);
await writeFile(
  "dist/robots.txt",
  `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`,
);
console.log(
  "GitHub Pages build prepared with 8 direct-entry pages, sitemap, and custom domain.",
);
