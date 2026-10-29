import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import fs from "node:fs";
const script = fs.readFileSync(
  new URL("../public/boot.js", import.meta.url),
  "utf8",
);
function run({
  hour = 12,
  language = "en-US",
  savedLanguage = null,
  savedTheme = null,
  visited = false,
  path = "/",
  blockedStorage = false,
} = {}) {
  let redirected = null;
  const doc = { documentElement: { dataset: {} } };
  const storage = new Map([
    ["deepoint-language", savedLanguage],
    ["deepoint-theme", savedTheme],
  ]);
  const session = new Map(visited ? [["deepoint-visited", "1"]] : []);
  const adapter = (map) => ({
    getItem: (k) => {
      if (blockedStorage) throw Error("Unavailable");
      return map.get(k) || null;
    },
    setItem: (k, v) => map.set(k, v),
  });
  vm.runInNewContext(script, {
    document: doc,
    localStorage: adapter(storage),
    sessionStorage: adapter(session),
    navigator: { language },
    location: {
      pathname: path,
      search: "",
      hash: "",
      replace: (url) => (redirected = url),
    },
    Date: class {
      getHours() {
        return hour;
      }
    },
  });
  return { theme: doc.documentElement.dataset.theme, redirected };
}
test("morning/night boundaries follow visitor time", () => {
  for (const [hour, theme] of [
    [0, "night"],
    [5, "night"],
    [6, "morning"],
    [17, "morning"],
    [18, "night"],
    [23, "night"],
  ])
    assert.equal(run({ hour }).theme, theme);
});
test("manual theme survives page navigation", () => {
  assert.equal(
    run({ hour: 12, savedTheme: "night", path: "/products.html" }).theme,
    "night",
  );
  assert.equal(run({ hour: 22, savedTheme: "morning" }).theme, "morning");
});
test("French browser language routes only first home entry", () => {
  assert.equal(run({ language: "fr-FR" }).redirected, "/fr/");
  assert.equal(run({ language: "fr-CA" }).redirected, "/fr/");
  assert.equal(run({ language: "en-GB" }).redirected, null);
  assert.equal(run({ language: "fr", visited: true }).redirected, null);
  assert.equal(
    run({ language: "fr", path: "/resources.html" }).redirected,
    null,
  );
});
test("explicit language wins and storage denial still shows theme", () => {
  assert.equal(run({ language: "fr", savedLanguage: "en" }).redirected, null);
  assert.equal(run({ language: "en", savedLanguage: "fr" }).redirected, "/fr/");
  assert.equal(run({ hour: 12, blockedStorage: true }).theme, "morning");
});
