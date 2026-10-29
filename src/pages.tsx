import { useEffect, useState } from "react";
import {
  Arrow,
  Contact,
  Gallery,
  SectionLabel,
  useT,
  useLanguage,
  pagePath,
  WA,
} from "./shared";
import catalog from "./data/products.json";
import guides from "./data/guides.json";
import { SizingTool, RoiTool } from "./tools";
const categoryNames = {
  inverter: { en: "Inverters", fr: "Onduleurs" },
  storage: { en: "Energy storage", fr: "Stockage" },
  panel: { en: "Solar panels", fr: "Panneaux solaires" },
  lighting: { en: "Solar lighting", fr: "Éclairage solaire" },
  control: { en: "Controls & switching", fr: "Commande et commutation" },
};
export function PageIntro({
  number,
  title,
  accent,
  description,
}: {
  number: string;
  title: string;
  accent: string;
  description: string;
}) {
  return (
    <div className="page-intro">
      <SectionLabel number={number}>DEEPOINT NEW ENERGY</SectionLabel>
      <h1>
        {title}
        <br />
        <span className="soft-text">{accent}</span>
      </h1>
      <p>{description}</p>
    </div>
  );
}
export function ProductsPage() {
  const t = useT(),
    lang = useLanguage(),
    [brand, setBrand] = useState("all"),
    [category, setCategory] = useState("all"),
    [expanded, setExpanded] = useState("");
  useEffect(() => {
    const readHash = () => {
      const hash = decodeURIComponent(location.hash.slice(1));
      if (hash in categoryNames) {
        setCategory(hash);
        setExpanded("");
      } else if (catalog.some((p) => p.id === hash)) {
        setCategory("all");
        setBrand("all");
        setExpanded(hash);
        setTimeout(
          () =>
            document.getElementById(hash)?.scrollIntoView({ block: "center" }),
          100,
        );
      }
    };
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);
  const products = catalog.filter(
    (p) =>
      (brand === "all" || p.brand.toLowerCase() === brand) &&
      (category === "all" || p.category === category),
  );
  return (
    <>
      <PageIntro
        number="01"
        title={t("Good systems start", "Les bons systèmes commencent")}
        accent={t("with the right products.", "par les bons produits.")}
        description={t(
          "Explore Deye and Deepoint inverters, storage and solar essentials. Open a product to see the details.",
          "Découvrez les onduleurs, le stockage et les équipements solaires Deye et Deepoint. Ouvrez un produit pour consulter ses caractéristiques.",
        )}
      />
      <section className="section catalog-section">
        <div className="catalog-filters">
          <div
            className="brand-filters"
            role="group"
            aria-label={t("Brand", "Marque")}
          >
            {[
              ["all", t("All brands", "Toutes les marques")],
              ["deye", "Deye"],
              ["deepoint", "Deepoint"],
            ].map(([id, name]) => (
              <button
                key={id}
                aria-pressed={brand === id}
                onClick={() => {
                  setBrand(id);
                  setExpanded("");
                }}
              >
                {name}
              </button>
            ))}
          </div>
          <label className="select-filter">
            <span>{t("Category", "Catégorie")}</span>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setExpanded("");
              }}
            >
              <option value="all">
                {t("All products", "Tous les produits")}
              </option>
              {Object.entries(categoryNames).map(([id, name]) => (
                <option value={id} key={id}>
                  {name[lang]}
                </option>
              ))}
            </select>
          </label>
          <p className="muted">
            {products.length} {t("products", "produits")}
          </p>
        </div>
        <div className="catalog-grid">
          {products.map((p) => (
            <article
              className={`catalog-product ${expanded === p.id ? "expanded" : ""}`}
              key={p.id}
              id={p.id}
            >
              <button
                className="catalog-summary"
                aria-expanded={expanded === p.id}
                aria-controls={"details-" + p.id}
                onClick={() => {
                  setExpanded(expanded === p.id ? "" : p.id);
                  history.replaceState(null, "", "#" + p.id);
                }}
              >
                <span className="catalog-brand">{p.brand}</span>
                <div className="catalog-image">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="catalog-name">
                  <div>
                    <small>
                      {
                        categoryNames[
                          p.category as keyof typeof categoryNames
                        ]?.[lang]
                      }
                    </small>
                    <h2>{p.name}</h2>
                  </div>
                  <span className="expand-sign">
                    {expanded === p.id ? "−" : "+"}
                  </span>
                </div>
                <p>{p.description[lang]}</p>
              </button>
              <div
                className="catalog-details"
                id={"details-" + p.id}
                hidden={expanded !== p.id}
              >
                <dl className="spec-list">
                  {p.specs.map((s, i) => (
                    <div key={i}>
                      <dt>{s.label[lang]}</dt>
                      <dd>{lang === "fr" ? s.valueFr : s.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="detail-actions">
                  {p.pdf && (
                    <a
                      className="button secondary"
                      href={p.pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("Technical datasheet", "Fiche technique")} <Arrow />
                    </a>
                  )}
                  <Contact />
                </div>
              </div>
            </article>
          ))}
        </div>
        {products.length === 0 && (
          <p className="empty-state">
            {t(
              "No products match these filters. Try another brand or category.",
              "Aucun produit ne correspond. Essayez une autre marque ou catégorie.",
            )}
          </p>
        )}
      </section>
    </>
  );
}
export function SolutionsPage() {
  const t = useT(),
    lang = useLanguage();
  const entries = [
    {
      id: "residential",
      title: t("A home that keeps going.", "Une maison toujours en mouvement."),
      tag: t("01 / RESIDENTIAL", "01 / RÉSIDENTIEL"),
      text: t(
        "Keep everyday essentials powered with a matched hybrid inverter and battery system. Scale the installation around the household’s loads and backup needs.",
        "Alimentez les équipements essentiels avec un onduleur hybride et une batterie adaptés. Dimensionnez l’installation selon les usages du foyer et l’autonomie souhaitée.",
      ),
      products: t(
        "Deye hybrid inverter + lithium battery + solar panels",
        "Onduleur hybride Deye + batterie lithium + panneaux solaires",
      ),
      image: "/images/editorial/solution-residential.webp",
      bullets: [
        t("Everyday household loads", "Les usages du quotidien"),
        t("Energy stored for later", "L’énergie stockée pour plus tard"),
        t("A system sized for your home", "Un système adapté à votre maison"),
      ],
    },
    {
      id: "commercial",
      title: t(
        "More business. Less interruption.",
        "Plus d’activité. Moins d’interruptions.",
      ),
      tag: t("02 / COMMERCIAL & INDUSTRIAL", "02 / COMMERCIAL ET INDUSTRIEL"),
      text: t(
        "Build around the way your business uses energy. Explore high-power hybrid inverters, modular storage and commercial systems for larger buildings and demanding loads.",
        "Concevez votre système autour de la consommation de votre activité. Découvrez les onduleurs hybrides haute puissance, le stockage modulaire et les systèmes pour les bâtiments et usages exigeants.",
      ),
      products: t(
        "50–80 kW hybrid inverter / BOS-B / MS-GS-215",
        "Onduleur hybride 50–80 kW / BOS-B / MS-GS-215",
      ),
      image: "/images/editorial/solution-commercial.webp",
      bullets: [
        t(
          "Shops, offices and larger sites",
          "Commerces, bureaux et grands sites",
        ),
        t(
          "Solar and storage working together",
          "Le solaire et le stockage associés",
        ),
        t(
          "Project-based system configuration",
          "Une configuration adaptée au projet",
        ),
      ],
    },
    {
      id: "offgrid",
      title: t("Power beyond the grid.", "L’énergie au-delà du réseau."),
      tag: t("03 / OFF-GRID", "03 / HORS RÉSEAU"),
      text: t(
        "Bring solar and storage to sites where the grid is limited or unavailable. Match Deepoint and Deye equipment to the daily loads, location and required autonomy.",
        "Apportez le solaire et le stockage aux sites peu ou pas raccordés. Adaptez les équipements Deepoint et Deye aux besoins quotidiens, au lieu et à l’autonomie nécessaire.",
      ),
      products: t(
        "Off-grid inverter + lithium storage + PV array",
        "Onduleur hors réseau + stockage lithium + champ photovoltaïque",
      ),
      image: "/images/editorial/solution-offgrid.webp",
      bullets: [
        t("Remote and independent sites", "Sites isolés et autonomes"),
        t("Designed around daily demand", "Conçu selon les besoins quotidiens"),
        t(
          "Support from product to installation",
          "Un accompagnement jusqu’à l’installation",
        ),
      ],
    },
  ];
  return (
    <>
      <PageIntro
        number="02"
        title={t("Different places.", "Des lieux différents.")}
        accent={t("The same good energy.", "La même bonne énergie.")}
        description={t(
          "Solar and storage configurations for homes, businesses and places beyond the grid.",
          "Des configurations solaires et de stockage pour les foyers, les entreprises et les sites isolés.",
        )}
      />
      <nav
        className="section-anchors"
        aria-label={t("Solution types", "Types de solutions")}
      >
        {entries.map((e) => (
          <a href={"#" + e.id} key={e.id}>
            {e.id === "residential"
              ? t("Residential", "Résidentiel")
              : e.id === "commercial"
                ? t("Commercial", "Professionnel")
                : t("Off-grid", "Hors réseau")}{" "}
            ↓
          </a>
        ))}
      </nav>
      {entries.map((e) => (
        <section key={e.id} id={e.id} className="solution-section section">
          <div className="solution-image parallax-image">
            <img src={e.image} alt={e.title} loading="lazy" />
          </div>
          <div className="solution-copy reveal">
            <p className="eyebrow">{e.tag}</p>
            <h2>{e.title}</h2>
            <p>{e.text}</p>
            <ul>
              {e.bullets.map((b, i) => (
                <li key={b}>
                  <span>0{i + 1}</span>
                  {b}
                </li>
              ))}
            </ul>
            <p className="system-combination">{e.products}</p>
            <div className="detail-actions">
              <Contact />
              <a className="text-link" href={pagePath("products", lang)}>
                {t("Explore the products", "Découvrir les produits")}
                <Arrow />
              </a>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
export function ResourcesPage() {
  const t = useT(),
    lang = useLanguage();
  const [openGuide, setOpenGuide] = useState("");
  useEffect(() => {
    const readHash = () => {
      const hash = decodeURIComponent(location.hash.slice(1));
      if (hash.startsWith("guide-")) {
        setOpenGuide(hash);
        setTimeout(() => document.getElementById(hash)?.scrollIntoView(), 100);
      }
    };
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);
  return (
    <>
      <PageIntro
        number="03"
        title={t("A little knowledge.", "Les bonnes connaissances.")}
        accent={t("A better installation.", "Une meilleure installation.")}
        description={t(
          "Product documents, practical guides and planning tools, together in one place.",
          "Documents produits, guides pratiques et outils de dimensionnement réunis au même endroit.",
        )}
      />
      <nav
        className="section-anchors"
        aria-label={t("Resource sections", "Rubriques des ressources")}
      >
        <a href="#downloads">{t("Downloads", "Téléchargements")} ↓</a>
        <a href="#guides">Guides ↓</a>
        <a href="#tools">{t("Tools", "Outils")} ↓</a>
      </nav>
      <section className="section" id="downloads">
        <div className="section-heading reveal">
          <div>
            <SectionLabel number="01">
              {t("The technical details", "Les informations techniques")}
            </SectionLabel>
            <h2>{t("Straight to the source.", "Directement à la source.")}</h2>
          </div>
          <p className="section-note">
            {t(
              "Open or download product datasheets directly. No registration needed.",
              "Consultez ou téléchargez les fiches produits directement, sans inscription.",
            )}
          </p>
        </div>
        <div className="download-list">
          {[
            ["deye", "Deye"],
            ["deepoint", "Deepoint"],
          ].map(([id, name]) => (
            <a
              href={`/documents/${id}-catalogue.pdf`}
              key={id}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="document-type">PDF</span>
              <span>
                <small>{name}</small>
                <strong>{t("Product catalogue", "Catalogue produits")}</strong>
              </span>
              <Arrow />
            </a>
          ))}
          {catalog
            .filter((p) => p.pdf)
            .map((p) => (
              <a
                href={p.pdf!}
                key={p.id}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="document-type">PDF</span>
                <span>
                  <small>{p.brand}</small>
                  <strong>{p.name}</strong>
                </span>
                <Arrow />
              </a>
            ))}
        </div>
      </section>
      <section className="section guides-section" id="guides">
        <div className="section-heading reveal">
          <div>
            <SectionLabel number="02">
              {t("Read, understand, build", "Lire, comprendre, installer")}
            </SectionLabel>
            <h2>{t("Useful things to know.", "Les repères utiles.")}</h2>
          </div>
        </div>
        <div className="guides-list">
          {guides.map((g, i) => (
            <article
              id={"guide-" + g.id}
              key={g.id}
              className={`guide ${openGuide === "guide-" + g.id ? "is-open" : ""}`}
            >
              <button
                aria-expanded={openGuide === "guide-" + g.id}
                aria-controls={"body-" + g.id}
                className="guide-title"
                onClick={() => {
                  const next =
                    openGuide === "guide-" + g.id ? "" : "guide-" + g.id;
                  setOpenGuide(next);
                  if (next) history.replaceState(null, "", "#" + next);
                }}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{g.title[lang]}</h3>
                  <p>{g.summary[lang]}</p>
                </div>
                <span className="expand-sign">
                  {openGuide === "guide-" + g.id ? "−" : "+"}
                </span>
              </button>
              <div
                id={"body-" + g.id}
                className="guide-body"
                hidden={openGuide !== "guide-" + g.id}
                dangerouslySetInnerHTML={{ __html: g.html[lang] }}
              />
            </article>
          ))}
        </div>
      </section>
      <section id="tools" className="section tools-section">
        <div className="section-heading reveal">
          <div>
            <SectionLabel number="03">
              {t("Plan with a clearer picture", "Préparer avec des repères")}
            </SectionLabel>
            <h2>
              {t("Make the numbers", "Des chiffres pour")}
              <br />
              <span className="soft-text">
                {t("work for you.", "mieux décider.")}
              </span>
            </h2>
          </div>
          <p className="section-note">
            {t(
              "Planning estimates to start a conversation. Your installer confirms the final design.",
              "Des estimations pour préparer votre projet. Votre installateur confirme le dimensionnement final.",
            )}
          </p>
        </div>
        <SizingTool />
        <RoiTool />
      </section>
    </>
  );
}
export function AboutPage() {
  const t = useT();
  return (
    <>
      <PageIntro
        number="04"
        title={t("Products you can see.", "Des produits à découvrir.")}
        accent={t("People you can reach.", "Une équipe à votre écoute.")}
        description={t(
          "Deepoint New Energy supplies solar panels, hybrid inverters and energy storage for partners across West Africa. We bring together Deye and Deepoint products with regional supply and support.",
          "Deepoint New Energy fournit des panneaux solaires, des onduleurs hybrides et du stockage aux partenaires en Afrique de l’Ouest. Nous réunissons les produits Deye et Deepoint avec un approvisionnement et un accompagnement régionaux.",
        )}
      />
      <section className="section about-showroom">
        <Gallery
          images={[1, 2, 3].map((n) => `/images/editorial/showroom-${n}.webp`)}
          label={t("Deepoint showroom", "Showroom Deepoint")}
        />
        <div className="about-information">
          <div>
            <SectionLabel number="01">
              {t("Visit the showroom", "Visiter le showroom")}
            </SectionLabel>
            <h2>
              Sixty5 complex
              <br />
              Dawaki ext
            </h2>
            <Contact>{t("Arrange a visit", "Organiser une visite")}</Contact>
          </div>
          <div>
            <SectionLabel number="02">
              {t("Our regional connections", "Nos connexions régionales")}
            </SectionLabel>
            <ul className="region-list">
              {[
                t("Nigeria", "Nigeria"),
                t("Cameroon", "Cameroun"),
                t("Mali", "Mali"),
                t("Sierra Leone", "Sierra Leone"),
              ].map((r, i) => (
                <li key={r}>
                  <span>0{i + 1}</span>
                  {r}
                  <span className="status-dot" />
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="company-contact">
          <span className="eyebrow">
            {t("KEEP IN TOUCH", "RESTONS EN CONTACT")}
          </span>
          <a href="mailto:info@deepoint.net">
            info@deepoint.net <Arrow />
          </a>
          <a href={WA} target="_blank" rel="noopener noreferrer">
            +86 138 5740 9664 <Arrow />
          </a>
        </div>
      </section>
    </>
  );
}
