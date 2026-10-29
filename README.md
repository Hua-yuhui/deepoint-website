# Deepoint

Independent English / French solar website built with React, TypeScript, Vite and custom CSS. The original website directory is read-only input; this checkout is the complete replacement Site source.

## Development

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

Build output is `dist/`: ten prerendered localized pages and 48 legacy redirect documents. No backend, API credentials, contact forms or database are required. All contact links open the existing WhatsApp number directly.

## Content

- `src/data/products.json`: 32 catalog entries, bilingual descriptions, translated specification values, four featured products and document/image references.
- `src/data/guides.json`: nine complete bilingual guides; sanitized article HTML is trusted build-time content only.
- `src/data/map.json`: four geographic media entries; one selected at a time.
- `src/data/cases.json`: three installation stories.
- `src/data/plans.json`: the ten original calculator reference configurations. Prices remain editable assumptions, not current offers.
- `scripts/product-sources.json`: product parameter provenance and verification notes.

Images and documents are served from `public/`. The original source files are preserved. Large product PDFs have web-optimized image streams; page counts and extracted text were checked against their source copies. `scripts/optimize-pdfs.py` reproduces the optimization using Pillow and pypdf.

## Build and hosting

`scripts/generate.mjs` prerenders both languages, creates metadata and redirects, and writes the sitemap. Its `origin` matches the registered private Site. Update it when an actual hosting origin changes.

`.openai/hosting.json` binds this checkout to its existing Sites project. Reuse that project ID on updates. Do not create another Site for this checkout. Publishing uses the Sites source helper to commit, push and package the exact source state.

All files remain UTF-8. Generated HTML is pure ASCII with numeric entities, including French accents. `scripts/verify.mjs` checks encoding, local asset links, catalog references and required metadata. New Vite CSS and JS assets use content hashes rather than the original website's cache tokens.

## Interaction defaults

- Morning: 06:00 to 17:59 in the visitor's local time. Manual theme choice persists across pages.
- Browser language selects French only on the first home entry. An explicit EN/FR choice takes priority.
- Videos are muted and pause when their map entry is closed or the map leaves view.
- Motion respects `prefers-reduced-motion`.
- Header and footer provide five core page types; the header scrolls normally.
