# Deepoint Sites project

This directory is the independent replacement Site. Do not edit files in the original website outside this directory.

- All text files remain UTF-8. Never use GBK, CP936, Latin-1 or similar re-encoding.
- HTML files must contain only ASCII; encode non-ASCII characters as HTML entities. Never decode existing entities back to raw characters.
- French TSX/JSON string content keeps proper UTF-8 accents. Entities do not replace accented JavaScript strings.
- After each edit, run the encoding scan below. It must report no files.
- Use `npm test` and `npm run build` for meaningful verification. The build prerenders both languages, converts HTML to ASCII entities and checks local links and metadata.
- `dist/`, `.ssr/`, `node_modules/` and `qa/` are generated or local-only. CSS/JS use Vite hashes for cache invalidation.
- The Site project ID in `.openai/hosting.json` is authoritative. Reuse it, preserve owner-private access, and use the Sites workflow to push source and package the exact commit before publication.
- All contact links go directly to `https://wa.me/8613857409664`. Do not restore inquiry forms or the floating AI button.
- Keep source article content sanitized. Product specifications must be backed by supplied datasheets.

```sh
rg -l '[\p{Han}\x{FFFD}]' --glob '*.html' --glob '*.js' --glob '!node_modules/**' --glob '!.codex-backups/**' .
```
