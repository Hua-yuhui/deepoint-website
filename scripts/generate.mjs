import fs from "node:fs";
import path from "node:path";
import { render } from "../.ssr/prerender.js";
const origin = "https://deepoint-energy-public-20261029.sacred-rose-3108.chatgpt.site";
const ascii = (s) =>
  s.replace(/[^\x00-\x7F]/gu, (c) => `&#${c.codePointAt(0)};`);
const titles = {
  en: {
    home: "Solar power. Closer to your market.",
    products: "Deye & Deepoint product catalogue",
    solutions: "Solar and storage solutions",
    resources: "Datasheets, guides & solar calculators",
    about: "Meet Deepoint New Energy",
  },
  fr: {
    home: "L’énergie solaire. Au plus près de votre marché.",
    products: "Catalogue produits Deye et Deepoint",
    solutions: "Solutions solaires et de stockage",
    resources: "Fiches, guides et calculateurs solaires",
    about: "Découvrez Deepoint New Energy",
  },
};
const descriptions = {
  en: {
    home: "Explore Deye and Deepoint solar products, regional supply, warehouses and local support across West Africa.",
    products:
      "Compare Deye and Deepoint inverters, energy storage, solar panels and lighting. Read specifications and download product datasheets.",
    solutions:
      "Solar and battery system configurations for residential, commercial, industrial and off-grid installations.",
    resources:
      "Download datasheets, read practical solar guides and plan with system sizing and diesel comparison calculators.",
    about:
      "Discover Deepoint, visit the product showroom and connect with our team serving West Africa.",
  },
  fr: {
    home: "Découvrez les produits solaires Deye et Deepoint, l’approvisionnement régional et l’accompagnement en Afrique de l’Ouest.",
    products:
      "Comparez les onduleurs, batteries, panneaux et éclairages Deye et Deepoint. Caractéristiques et fiches techniques disponibles.",
    solutions:
      "Configurations solaires et de stockage pour les installations résidentielles, professionnelles et hors réseau.",
    resources:
      "Téléchargez les fiches techniques, lisez les guides et utilisez les calculateurs de dimensionnement et de comparaison au diesel.",
    about:
      "Découvrez Deepoint, visitez notre showroom et contactez l’équipe au service de l’Afrique de l’Ouest.",
  },
};
const template = fs.readFileSync("dist/index.html", "utf8");
const escape = (s) => s.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
const urls = [];
for (const locale of ["en", "fr"])
  for (const page of ["home", "products", "solutions", "resources", "about"]) {
    const route = `${locale === "fr" ? "/fr" : ""}/${page === "home" ? "" : page + ".html"}`;
    const other = `${locale === "fr" ? "" : "/fr"}/${page === "home" ? "" : page + ".html"}`;
    const title = `${titles[locale][page]} | Deepoint`;
    const meta = `<meta name="description" content="${escape(descriptions[locale][page])}"/><link rel="canonical" href="${origin + route}"/><link rel="alternate" hreflang="${locale}" href="${origin + route}"/><link rel="alternate" hreflang="${locale === "en" ? "fr" : "en"}" href="${origin + other}"/><link rel="alternate" hreflang="x-default" href="${origin + (locale === "en" ? route : other)}"/><meta property="og:title" content="${escape(title)}"/><meta property="og:description" content="${escape(descriptions[locale][page])}"/><meta property="og:type" content="website"/><meta property="og:url" content="${origin + route}"/><meta property="og:image" content="${origin}/images/hero-light.webp"/>${page === "home" ? '<link rel="preload" as="image" href="/images/hero-dark-mobile.webp" media="(max-width:768px)"/><link rel="preload" as="image" href="/images/hero-dark.webp" media="(min-width:769px)"/>' : ""}`;
    let html = template
      .replace('<html lang="en">', `<html lang="${locale}">`)
      .replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`)
      .replace("<!--page-meta-->", meta)
      .replace("<!--app-html-->", render(locale, page));
    const file = path.join(
      "dist",
      locale === "fr" ? "fr" : "",
      page === "home" ? "index.html" : page + ".html",
    );
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, ascii(html), "utf8");
    urls.push(origin + route);
  }
const redirects = {
  "hybrid-inverter.html": "products.html#inverter",
  "lithium-ess.html": "products.html#storage",
  "solar-panels.html": "products.html#panel",
  "residential.html": "solutions.html#residential",
  "commercial.html": "solutions.html#commercial",
  "commercial-solar-storage.html": "solutions.html#commercial",
  "off-grid.html": "solutions.html#offgrid",
  "off-grid-solar-system.html": "solutions.html#offgrid",
  "deye-distributor-west-africa.html": "about.html",
  "solar-inverter-nigeria.html": "products.html",
  "installation-cases.html": "#cases",
  "download-center.html": "resources.html#downloads",
  "solar-system-calculator.html": "resources.html#sizing",
  "deye-solar-nigeria.html": "resources.html#roi",
  "west-africa-solar-market-report.html":
    "resources.html#guide-electricity-2026",
};
const guides = JSON.parse(fs.readFileSync("src/data/guides.json", "utf8"));
for (const guide of guides)
  redirects[`articles/${guide.id}.html`] = `resources.html#guide-${guide.id}`;
for (const locale of ["en", "fr"])
  for (const [old, destination] of Object.entries(redirects)) {
    const target = `${locale === "fr" ? "/fr/" : "/"}${destination}`;
    const file = path.join("dist", locale === "fr" ? "fr" : "", old);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(
      file,
      ascii(
        `<!doctype html><html lang="${locale}"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Deepoint</title><meta name="robots" content="noindex"/><link rel="canonical" href="${origin + target}"/><meta http-equiv="refresh" content="0;url=${target}"/></head><body><a href="${target}">${locale === "fr" ? "Continuer" : "Continue"}</a><script>location.replace(${JSON.stringify(target)});</script></body></html>`,
      ),
      "utf8",
    );
  }
fs.writeFileSync(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${url}</loc></url>`).join("")}</urlset>`,
);
fs.writeFileSync(
  "dist/robots.txt",
  `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
);
console.log(
  `Prerendered ${urls.length} localized pages and ${Object.keys(redirects).length * 2} legacy redirects.`,
);
