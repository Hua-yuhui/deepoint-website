import { useState, useEffect, useRef } from "react";
import {
  Language,
  useT,
  useLanguage,
  WA,
  pagePath,
  Arrow,
  Close,
  WhatsApp,
  Contact,
  SectionLabel,
  Gallery,
  type Locale,
  type Page,
} from "./shared";
import { ProductsPage, SolutionsPage, ResourcesPage, AboutPage } from "./pages";
import productsData from "./data/products.json";
import geography from "./data/geography.json";
import regionsData from "./data/map.json";
import casesData from "./data/cases.json";
export type { Locale, Page } from "./shared";
export function detectRoute(path: string): { locale: Locale; page: Page } {
  const locale = path.startsWith("/fr") ? "fr" : "en";
  const name = path.split("/").pop()?.replace(".html", "");
  return {
    locale,
    page: (["products", "solutions", "resources", "about"].includes(name || "")
      ? name
      : "home") as Page,
  };
}
const pages: Page[] = ["home", "products", "solutions", "resources", "about"];
const navNames = {
  en: ["Home", "Products", "Solutions", "Resources", "About"],
  fr: ["Accueil", "Produits", "Solutions", "Ressources", "À propos"],
};
function Header({ page }: { page: Page }) {
  const lang = useLanguage(),
    t = useT(),
    [open, setOpen] = useState(false),
    drawer = useRef<HTMLDivElement>(null),
    menu = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = drawer.current?.querySelector<HTMLAnchorElement>("a");
    first?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menu.current?.focus();
      }
      if (e.key === "Tab") {
        const links = [
          ...drawer.current!.querySelectorAll<HTMLElement>("a,button"),
        ];
        const all = [...links, menu.current!],
          i = all.indexOf(document.activeElement as HTMLElement);
        if (!e.shiftKey && i === all.length - 1) {
          e.preventDefault();
          all[0].focus();
        }
        if (e.shiftKey && i === 0) {
          e.preventDefault();
          all.at(-1)?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", key);
    };
  }, [open]);
  return (
    <header className={`navbar ${page === "home" ? "navbar-hero" : ""}`}>
      <a href={pagePath("home", lang)} className="brand" aria-label="Deepoint">
        <img src="/images/logo.svg" alt="Deepoint" width="140" height="44" />
      </a>
      <nav
        className="desktop-nav"
        aria-label={t("Main navigation", "Navigation principale")}
      >
        {pages.slice(1).map((p, i) => (
          <a
            key={p}
            href={pagePath(p, lang)}
            aria-current={page === p ? "page" : undefined}
          >
            {navNames[lang][i + 1]}
          </a>
        ))}
      </nav>
      <div className="nav-right">
        <div className="language-switch" aria-label={t("Language", "Langue")}>
          {(["en", "fr"] as Locale[]).map((l) => (
            <a
              key={l}
              lang={l}
              href={pagePath(page, l)}
              aria-current={lang === l ? "true" : undefined}
              onClick={() => {
                try {
                  localStorage.setItem("deepoint-language", l);
                } catch {}
              }}
            >
              {l.toUpperCase()}
            </a>
          ))}
        </div>
        <a
          className="nav-contact"
          href={WA}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp <Arrow />
        </a>
        <button
          ref={menu}
          className={`menu-button ${open ? "is-open" : ""}`}
          onClick={() => setOpen(!open)}
          aria-label={
            open
              ? t("Close menu", "Fermer le menu")
              : t("Open menu", "Ouvrir le menu")
          }
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <span />
          <span />
        </button>
      </div>
      <div
        id="mobile-menu"
        ref={drawer}
        className={`mobile-menu ${open ? "is-open" : ""}`}
        inert={!open}
        aria-hidden={!open}
      >
        <p className="eyebrow">DEEPOINT / {t("EXPLORE", "EXPLORER")}</p>
        <nav>
          {pages.map((p, i) => (
            <a key={p} href={pagePath(p, lang)}>
              <small>0{i + 1}</small>
              {navNames[lang][i]}
              <Arrow />
            </a>
          ))}
        </nav>
        <Contact />
        <p className="muted">info@deepoint.net</p>
      </div>
    </header>
  );
}
function Footer() {
  const t = useT(),
    lang = useLanguage();
  return (
    <footer className="footer">
      <div className="footer-top">
        <SectionLabel number="↗">
          {t("Let’s keep you moving", "Avançons ensemble")}
        </SectionLabel>
        <h2>
          {t("Good energy.", "La bonne énergie.")}
          <br />
          <span>{t("Closer to you.", "Plus proche de vous.")}</span>
        </h2>
        <Contact />
      </div>
      <div className="footer-grid">
        <a className="brand" href={pagePath("home", lang)}>
          <img
            src="/images/logo.svg"
            width="160"
            height="52"
            alt="Deepoint"
            loading="lazy"
          />
        </a>
        <p>
          {t(
            "Solar, storage and local support for partners across West Africa.",
            "Solaire, stockage et accompagnement régional pour les partenaires en Afrique de l’Ouest.",
          )}
        </p>
        <nav aria-label={t("Footer navigation", "Navigation de pied de page")}>
          {pages.slice(1).map((p, i) => (
            <a key={p} href={pagePath(p, lang)}>
              {navNames[lang][i + 1]}
            </a>
          ))}
        </nav>
        <div>
          <a href="mailto:info@deepoint.net">info@deepoint.net</a>
          <a href={WA}>+86 138 5740 9664</a>
          <a
            href="https://www.instagram.com/deepointess/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram ↗
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Deepoint New Energy</span>
        <span>
          {t(
            "Made for a brighter everyday.",
            "Pour un quotidien plus lumineux.",
          )}
        </span>
        <a href="#top">{t("Back to top", "En haut")} ↑</a>
      </div>
    </footer>
  );
}
function Hero({
  theme,
  onTheme,
}: {
  theme: string;
  onTheme: (v: string) => void;
}) {
  const t = useT(),
    front = useRef<HTMLDivElement>(null),
    back = useRef<HTMLDivElement>(null),
    busy = useRef(false),
    timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  function toggle(target: string) {
    if (theme === target || busy.current) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      if (front.current) front.current.dataset.scene = target;
      if (back.current) back.current.dataset.scene = target;
      onTheme(target);
      return;
    }
    busy.current = true;
    const f = front.current,
      b = back.current;
    if (!f || !b) return;
    b.dataset.scene = target;
    f.dataset.scene = theme;
    f.classList.add("pull-down");
    timers.current.push(
      setTimeout(() => {
        onTheme(target);
        f.dataset.scene = target;
        timers.current.push(
          setTimeout(() => {
            f.classList.remove("pull-down");
            busy.current = false;
          }, 30),
        );
      }, 300),
    );
  }
  return (
    <section
      className="hero"
      aria-label={t(
        "Solar energy, morning and night",
        "L’énergie solaire, jour et nuit",
      )}
    >
      <div className="hero-bg-wrapper" aria-hidden="true">
        <div className="hero-bg bg-back" ref={back} />
        <div className="hero-bg bg-front" ref={front} />
      </div>
      <div className="hero-blur hero-blur-top" />
      <div className="hero-blur hero-blur-bottom" />
      <div className="hero-heading">
        <p className="hero-eyebrow">DEEPOINT NEW ENERGY</p>
        <h1>
          {t("Solar power.", "L’énergie solaire.")}
          <br />
          <span>{t("Closer to", "Au plus près de")}</span>
          <br className="mobile-break" />
          {t(" your market.", " votre marché.")}
        </h1>
      </div>
      <div className="hero-bottom">
        <div
          className="theme-toggle"
          role="group"
          aria-label={t("Time of day", "Moment de la journée")}
        >
          <span
            className={`toggle-indicator ${theme === "night" ? "is-night" : ""}`}
          />
          {["morning", "night"].map((mode) => (
            <button
              key={mode}
              className={`toggle-button ${theme === mode ? "active" : ""}`}
              onClick={() => toggle(mode)}
              aria-pressed={theme === mode}
            >
              <span>
                {mode === "morning"
                  ? t("Morning", "Le jour")
                  : t("Night", "La nuit")}
              </span>
              <small>
                {mode === "morning"
                  ? t("Powered by the sun", "L’énergie du soleil")
                  : t("Energy that stays", "L’énergie qui reste")}
              </small>
            </button>
          ))}
        </div>
        <p>
          {t(
            "Deye & Deepoint solar and storage. The right products, regional supply and support for your next installation.",
            "Le solaire et le stockage Deye et Deepoint. Les bons produits, un approvisionnement régional et un accompagnement pour vos installations.",
          )}
        </p>
        <a
          className="scroll-cue"
          href="#featured"
          aria-label={t("Explore our products", "Découvrir nos produits")}
        >
          <span />
          {t("Explore the possibilities", "Découvrez les possibilités")}
        </a>
      </div>
    </section>
  );
}
function Featured() {
  const t = useT(),
    lang = useLanguage(),
    track = useRef<HTMLDivElement>(null),
    [index, setIndex] = useState(0),
    [atEnd, setAtEnd] = useState(false);
  const featured = productsData.filter((p) => p.featured);
  const go = (delta: number) => {
    const e = track.current;
    if (e) {
      const gap = parseFloat(getComputedStyle(e).gap) || 0;
      const width = e.children[0]?.getBoundingClientRect().width || 0;
      e.scrollBy({ left: (width + gap) * delta, behavior: "smooth" });
    }
  };
  return (
    <section id="featured" className="section featured-section">
      <div className="section-heading reveal">
        <div>
          <SectionLabel number="01">
            {t("Selected for your next project", "Pour votre prochain projet")}
          </SectionLabel>
          <h2>
            {t("Built to power", "La puissance pour")}
            <br />
            <span className="soft-text">
              {t("bigger possibilities.", "aller plus loin.")}
            </span>
          </h2>
        </div>
        <a className="text-link" href={pagePath("products", lang)}>
          {t("Explore all products", "Tous les produits")}
          <Arrow />
        </a>
      </div>
      <div
        className="product-runway"
        ref={track}
        onScroll={() => {
          const e = track.current;
          if (e && e.children.length) {
            const gap = parseFloat(getComputedStyle(e).gap) || 0;
            const ended = e.scrollLeft + e.clientWidth >= e.scrollWidth - 4;
            setIndex(
              ended
                ? featured.length - 1
                : Math.round(
                    e.scrollLeft /
                      (e.children[0].getBoundingClientRect().width + gap),
                  ),
            );
            setAtEnd(ended);
          }
        }}
      >
        {featured.map((p, i) => (
          <article className="featured-product" key={p.id}>
            <div className="product-topline">
              <span>
                DEYE /{" "}
                {p.category === "storage"
                  ? t("ENERGY STORAGE", "STOCKAGE")
                  : t("HYBRID INVERTER", "ONDULEUR HYBRIDE")}
              </span>
              <span>0{i + 1}</span>
            </div>
            <a
              className="product-art"
              href={pagePath("products", lang) + "#" + p.id}
            >
              <span className="product-orbit" />
              <img src={p.image} alt={p.name} loading="lazy" decoding="async" />
            </a>
            <div className="featured-info">
              <h3>{p.name}</h3>
              <dl>
                {p.specs.slice(0, 3).map((s, i) => (
                  <div key={i}>
                    <dt>{s.label[lang]}</dt>
                    <dd>{lang === "fr" ? s.valueFr : s.value}</dd>
                  </div>
                ))}
              </dl>
              <a
                className="product-link"
                href={pagePath("products", lang) + "#" + p.id}
              >
                {t("Meet the product", "Découvrir le produit")}
                <Arrow />
              </a>
            </div>
          </article>
        ))}
      </div>
      <div className="runway-controls">
        <span>
          {String(Math.min(index + 1, featured.length)).padStart(2, "0")}{" "}
          <span className="muted">
            / {String(featured.length).padStart(2, "0")}
          </span>
        </span>
        <div className="control-pair">
          <button
            className="circle-button"
            disabled={index === 0}
            onClick={() => go(-1)}
            aria-label={t("Previous product", "Produit précédent")}
          >
            <Arrow left />
          </button>
          <button
            className="circle-button"
            disabled={atEnd}
            onClick={() => go(1)}
            aria-label={t("Next product", "Produit suivant")}
          >
            <Arrow />
          </button>
        </div>
      </div>
    </section>
  );
}
type Region = {
  id: string;
  name: { en: string; fr: string };
  city: string;
  x: number;
  y: number;
  image: string;
  video?: string;
};
function WarehouseMap() {
  const lang = useLanguage(),
    t = useT(),
    regions = regionsData as Region[],
    [selected, setSelected] = useState<Region | null>(null),
    [dimensions, setDimensions] = useState({ width: 360, height: 450 }),
    stage = useRef<HTMLDivElement>(null),
    [videoBlocked, setVideoBlocked] = useState(false),
    [failed, setFailed] = useState(false),
    video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const root = stage.current;
    if (!root) return;
    const ro = new ResizeObserver(([e]) =>
      setDimensions({
        width: e.contentRect.width,
        height: e.contentRect.height,
      }),
    );
    ro.observe(root);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    setFailed(false);
    setVideoBlocked(false);
    if (!selected?.video) return;
    const v = video.current;
    v?.play().catch(() => setVideoBlocked(true));
    return () => {
      v?.pause();
    };
  }, [selected]);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const v = video.current;
        if (!entry.isIntersecting) v?.pause();
        else if (v && selected?.video)
          v.play().catch(() => setVideoBlocked(true));
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [selected]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  const choose = (region: Region) =>
    setSelected((s) => (s?.id === region.id ? null : region));
  const mobile = dimensions.width < 700;
  const view = mobile
    ? { x: 110, y: 55, w: 550, h: 455 }
    : { x: 0, y: 0, w: 760, h: 560 };
  const mapH = mobile
      ? dimensions.width * 0.83
      : Math.min(560, dimensions.width * 0.65),
    mapW = mobile ? dimensions.width : (mapH * 760) / 560,
    left = (dimensions.width - mapW) / 2,
    top = 180;
  const pos = selected
    ? {
        x: left + ((selected.x - view.x) / view.w) * mapW,
        y: top + ((selected.y - view.y) / view.h) * mapH,
      }
    : null;
  const mediaW = Math.min(280, dimensions.width - 32),
    mediaH = mediaW * 0.67 + 38;
  const mediaLeft = pos
    ? Math.max(16, Math.min(pos.x - mediaW / 2, dimensions.width - mediaW - 16))
    : 16;
  const mediaTop = pos ? Math.max(0, pos.y - mediaH - 58) : 0;
  return (
    <section className="section network-section" id="network">
      <div className="section-heading reveal">
        <div>
          <SectionLabel number="02">
            {t("A regional connection", "Une présence régionale")}
          </SectionLabel>
          <h2>
            {t("Closer on the map.", "Proches sur la carte.")}
            <br />
            <span className="soft-text">
              {t("Closer in real life.", "Proches sur le terrain.")}
            </span>
          </h2>
        </div>
        <p className="section-note">
          {t(
            "Four connections. One energy partner. Tap a region to take a look.",
            "Quatre points de connexion. Un partenaire énergie. Touchez une région pour explorer.",
          )}
        </p>
      </div>
      <div
        className="map-tabs"
        role="group"
        aria-label={t("Choose a region", "Choisir une région")}
      >
        {regions.map((r) => (
          <button
            key={r.id}
            aria-pressed={selected?.id === r.id}
            onClick={() => choose(r)}
          >
            {r.name[lang]}
            <span />
          </button>
        ))}
      </div>
      <div
        className="map-stage"
        ref={stage}
        style={{ height: top + mapH + 30 }}
        onClick={() => setSelected(null)}
      >
        <span className="map-watermark" aria-hidden="true">
          WEST
          <br />
          AFRICA
        </span>
        <svg
          className="region-map"
          viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
          style={{ top, left, width: mapW, height: mapH }}
          aria-label={t(
            "Interactive West and Central Africa map",
            "Carte interactive de l’Afrique de l’Ouest et centrale",
          )}
        >
          {geography.map((c) => {
            const region = regions.find((r) => r.name.en === c.name);
            return (
              <path
                key={c.name}
                d={c.d}
                className={`country ${region ? "country-active" : ""} ${region && selected?.id === region.id ? "country-selected" : ""}`}
                role={region ? "button" : undefined}
                tabIndex={region ? 0 : undefined}
                aria-label={region ? region.name[lang] : undefined}
                aria-pressed={region ? selected?.id === region.id : undefined}
                onClick={
                  region
                    ? (e) => {
                        e.stopPropagation();
                        choose(region);
                      }
                    : undefined
                }
                onKeyDown={
                  region
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          choose(region);
                        }
                      }
                    : undefined
                }
              >
                <title>{region ? region.name[lang] : c.name}</title>
              </path>
            );
          })}
          {regions.map((r) => (
            <g
              key={r.id}
              className={`map-marker ${selected?.id === r.id ? "selected" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                choose(r);
              }}
              aria-hidden="true"
            >
              <circle className="marker-halo" cx={r.x} cy={r.y} r="15" />
              <circle cx={r.x} cy={r.y} r="4" />
              <text
                x={r.x + (r.id === "sierra-leone" ? -10 : 10)}
                y={r.y - 13}
                textAnchor={r.id === "sierra-leone" ? "end" : "start"}
              >
                {r.city}
              </text>
            </g>
          ))}
        </svg>
        {selected && pos && (
          <>
            <svg className="map-connection" aria-hidden="true">
              <path
                key={selected.id}
                d={`M ${pos.x} ${pos.y} L ${pos.x} ${mediaTop + mediaH + 18} Q ${pos.x} ${mediaTop + mediaH} ${mediaLeft + mediaW / 2} ${mediaTop + mediaH}`}
              />
            </svg>
            <div
              className="map-media"
              key={selected.id}
              style={{ left: mediaLeft, top: mediaTop, width: mediaW }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="map-media-title">
                <span>{selected.name[lang]}</span>
                <button
                  className="icon-button"
                  aria-label={t("Close media", "Fermer le média")}
                  onClick={() => setSelected(null)}
                >
                  <Close />
                </button>
              </div>
              {failed ? (
                <div className="media-failure">
                  <p>
                    {t(
                      "Media could not load.",
                      "Le média n’a pas pu être chargé.",
                    )}
                  </p>
                  <button
                    onClick={() => {
                      setFailed(false);
                      video.current?.load();
                    }}
                  >
                    {t("Try again", "Réessayer")}
                  </button>
                </div>
              ) : selected.video ? (
                <div className="map-video-wrap">
                  <video
                    ref={video}
                    src={selected.video}
                    poster={selected.image}
                    muted
                    playsInline
                    loop
                    controls
                    preload="metadata"
                    onError={() => setFailed(true)}
                  />
                  {videoBlocked && (
                    <button
                      className="video-play"
                      onClick={() =>
                        video.current
                          ?.play()
                          .then(() => setVideoBlocked(false))
                          .catch(() => {})
                      }
                    >
                      {t("Play video", "Lire la vidéo")} ▷
                    </button>
                  )}
                </div>
              ) : (
                <img
                  src={selected.image}
                  alt={t(
                    "Deepoint warehouse and stock",
                    "Entrepôt et stock Deepoint",
                  )}
                  onError={() => setFailed(true)}
                />
              )}
            </div>
          </>
        )}
      </div>
      <div className="network-bottom">
        <span className="status-dot" />
        <p>
          {t(
            "Nigeria · Cameroon · Mali · Sierra Leone",
            "Nigeria · Cameroun · Mali · Sierra Leone",
          )}
        </p>
        <Contact className="text-link" />
      </div>
    </section>
  );
}
function Showroom() {
  const t = useT();
  return (
    <section className="section showroom-section" id="showroom">
      <div className="section-heading reveal">
        <div>
          <SectionLabel number="03">
            {t("Come a little closer", "Entrez et découvrez")}
          </SectionLabel>
          <h2>
            {t("See it. Feel it.", "Voir. Découvrir.")}
            <br />
            <span className="soft-text">
              {t("Meet your next system.", "Votre prochain système.")}
            </span>
          </h2>
        </div>
        <p className="section-note">
          {t(
            "A place to explore the products behind your next installation.",
            "Un lieu pour découvrir les produits de votre prochaine installation.",
          )}
        </p>
      </div>
      <Gallery
        images={[1, 2, 3].map((n) => `/images/editorial/showroom-${n}.webp`)}
        label={t("Deepoint product showroom", "Salle d’exposition Deepoint")}
      />
      <div className="showroom-address">
        <div>
          <span className="eyebrow">{t("THE SHOWROOM", "LE SHOWROOM")}</span>
          <p>Sixty5 complex Dawaki ext</p>
        </div>
        <Contact>{t("Arrange a visit", "Organiser une visite")}</Contact>
      </div>
    </section>
  );
}
function Cases() {
  const t = useT(),
    lang = useLanguage();
  return (
    <section className="section cases-section" id="cases">
      <div className="section-heading reveal">
        <div>
          <SectionLabel number="04">
            {t("Energy, out in the world", "L’énergie sur le terrain")}
          </SectionLabel>
          <h2>
            {t("From a plan", "Du projet")}
            <br />
            <span className="soft-text">
              {t("to everyday power.", "à l’énergie au quotidien.")}
            </span>
          </h2>
        </div>
      </div>
      <div className="cases-grid">
        {casesData.map((c, i) => (
          <article key={c.id} className={`case-tile case-${i} reveal`}>
            <div className="case-image">
              <img src={c.image} alt={c.title[lang]} loading="lazy" />
              {c.video && (
                <a
                  className="case-play"
                  href={c.video}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t(
                    "Watch project video",
                    "Voir la vidéo du projet",
                  )}
                >
                  ▷
                </a>
              )}
              <span className="case-index">0{i + 1}</span>
            </div>
            <h3>{c.title[lang]}</h3>
            <p>{c.summary[lang]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
export function App({ locale, page }: { locale: Locale; page: Page }) {
  const [theme, setTheme] = useState("night");
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme || "night");
    document.documentElement.lang = locale;
  }, [locale]);
  function changeTheme(value: string) {
    setTheme(value);
    document.documentElement.dataset.theme = value;
    try {
      localStorage.setItem("deepoint-theme", value);
    } catch {}
  }
  useEffect(() => {
    document.documentElement.classList.add("js-motion");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.08 },
    );
    document.querySelectorAll(".reveal").forEach((e) => observer.observe(e));
    let frame = 0;
    function scroll() {
      if (reduced || frame) return;
      frame = requestAnimationFrame(() => {
        document
          .querySelectorAll<HTMLElement>(".parallax-image")
          .forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.top < innerHeight && r.bottom > 0)
              el.style.setProperty(
                "--parallax",
                `${(r.top - innerHeight / 2) * 0.055}px`,
              );
          });
        frame = 0;
      });
    }
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scroll);
    };
  }, [page]);
  return (
    <Language.Provider value={locale}>
      <div id="top" className={`site page-${page}`}>
        <a className="skip-link" href="#main">
          {locale === "fr" ? "Aller au contenu" : "Skip to content"}
        </a>
        <Header page={page} />
        <main id="main">
          {page === "home" ? (
            <>
              <Hero theme={theme} onTheme={changeTheme} />
              <Featured />
              <WarehouseMap />
              <Showroom />
              <Cases />
            </>
          ) : page === "products" ? (
            <ProductsPage />
          ) : page === "solutions" ? (
            <SolutionsPage />
          ) : page === "resources" ? (
            <ResourcesPage />
          ) : (
            <AboutPage />
          )}
        </main>
        <Footer />
        <a
          className="floating-whatsapp"
          href={WA}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={
            locale === "fr" ? "Contacter sur WhatsApp" : "Chat on WhatsApp"
          }
        >
          <WhatsApp />
        </a>
      </div>
    </Language.Provider>
  );
}
