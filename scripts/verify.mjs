import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
    );
const files = walk("dist");
let checked = 0;
for (const file of files) {
  if (!/\.(html|js|css|xml|txt)$/.test(file)) continue;
  const text = fs.readFileSync(file, "utf8");
  assert(!/[\p{Script=Han}\uFFFD]/u.test(text), `Encoding corruption: ${file}`);
  if (file.endsWith(".html")) {
    assert(!/[^\x00-\x7F]/.test(text), `Raw non-ASCII in HTML: ${file}`);
    for (const match of text.matchAll(
      /(?:href|src|poster)="(\/(?!\/)[^"?#]*)(?:[^" ]*)"/g,
    )) {
      let target = match[1];
      if (target.endsWith("/")) target += "index.html";
      assert(
        fs.existsSync(path.join("dist", decodeURIComponent(target))),
        `Missing ${target} in ${file}`,
      );
      checked++;
    }
  }
}
const catalog = JSON.parse(fs.readFileSync("src/data/products.json", "utf8"));
assert.equal(new Set(catalog.map((p) => p.id)).size, catalog.length);
assert.equal(catalog.filter((p) => p.featured).length, 4);
for (const p of catalog) {
  assert(p.description.en && p.description.fr);
  assert(p.specs.length);
  for (const field of ["image", "pdf"])
    if (p[field]) assert(fs.statSync(path.join("dist", p[field])).size > 0);
}
for (const lang of ["", "fr/"])
  for (const page of ["index", "products", "solutions", "resources", "about"]) {
    const text = fs.readFileSync(`dist/${lang}${page}.html`, "utf8");
    assert(text.includes(`lang="${lang ? "fr" : "en"}"`));
    assert(text.includes('hreflang="fr"'));
    assert(text.includes('rel="canonical"'));
    assert(!text.includes("heroScrollVideo"));
    assert(!/data-open-modal|float-btn ai|\/api\/contact/.test(text));
  }
console.log(
  `Verified ${files.length} output files, ${catalog.length} products and ${checked} local links. HTML is ASCII; UTF-8 scan clean.`,
);
