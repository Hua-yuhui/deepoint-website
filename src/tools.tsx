import { useState } from "react";
import {
  calculateSizing,
  calculateRoi,
  defaultLoads,
  recommendPlan,
} from "./calculators.mjs";
import plans from "./data/plans.json";
import { useT, useLanguage, Contact } from "./shared";
const applianceNames = [
  ["LED lights", "Lampes LED"],
  ["Ceiling fan", "Ventilateur"],
  ["Refrigerator", "Réfrigérateur"],
  ["Chest freezer", "Congélateur"],
  ["TV", "Téléviseur"],
  ["Wi-Fi router", "Routeur Wi-Fi"],
  ["Laptop", "Ordinateur portable"],
  ["Air conditioner 1.5 HP", "Climatiseur 1,5 CV"],
  ["Air conditioner 1.0 HP", "Climatiseur 1 CV"],
  ["Water pump 1 HP", "Pompe à eau 1 CV"],
  ["Washing machine", "Lave-linge"],
  ["CCTV / security", "Vidéosurveillance"],
];
export function SizingTool() {
  const t = useT(),
    lang = useLanguage(),
    [loads, setLoads] = useState(defaultLoads.map((r: number[]) => [...r])),
    [names, setNames] = useState(
      applianceNames.map((n) => n[lang === "fr" ? 1 : 0]),
    ),
    [sun, setSun] = useState(4.5),
    [autonomy, setAutonomy] = useState(1);
  const result = calculateSizing(loads, sun, autonomy);
  const num = (n: number) =>
    new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-GB", {
      maximumFractionDigits: 1,
    }).format(n);
  function update(i: number, j: number, v: number) {
    setLoads((current) =>
      current.map((row: number[], index: number) =>
        index === i
          ? row.map((n: number, k: number) => (k === j ? v : n))
          : row,
      ),
    );
  }
  return (
    <div className="calculator" id="sizing">
      <div className="calculator-heading">
        <span className="eyebrow">{t("SYSTEM SIZING", "DIMENSIONNEMENT")}</span>
        <h3>
          {t("What does your site need?", "De quoi votre site a-t-il besoin ?")}
        </h3>
        <p>
          {t(
            "Add your daily loads to estimate inverter, battery and solar capacity.",
            "Renseignez vos usages quotidiens pour estimer la puissance de l’onduleur, la batterie et le champ solaire.",
          )}
        </p>
      </div>
      <div className="sizing-layout">
        <div>
          <div className="load-head">
            <span>{t("Appliance", "Équipement")}</span>
            <span>{t("Qty", "Qté")}</span>
            <span>W</span>
            <span>h/{t("day", "jour")}</span>
          </div>
          <div className="loads">
            {loads.map((row: number[], i: number) => (
              <div className="load-row" key={i}>
                {i < 12 ? (
                  <label htmlFor={"load-" + i + "-0"}>{names[i]}</label>
                ) : (
                  <input
                    className="custom-load-name"
                    aria-label={t(
                      "Custom appliance name",
                      "Nom de l’équipement",
                    )}
                    value={names[i]}
                    onChange={(e) =>
                      setNames((current) =>
                        current.map((n, index) =>
                          index === i ? e.target.value : n,
                        ),
                      )
                    }
                  />
                )}{" "}
                {row.map((n: number, j: number) => (
                  <input
                    key={j}
                    id={`load-${i}-${j}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max={j === 2 ? 24 : undefined}
                    step={j === 2 ? 0.5 : 1}
                    value={Number.isNaN(n) ? "" : n}
                    onChange={(e) =>
                      update(
                        i,
                        j,
                        e.target.value === "" ? NaN : Number(e.target.value),
                      )
                    }
                    aria-label={`${names[i]} ${j === 0 ? t("quantity", "quantité") : j === 1 ? t("watts", "watts") : t("hours per day", "heures par jour")}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <button
            className="text-link add-load"
            onClick={() => {
              setLoads((v) => [...v, [1, 100, 2]]);
              setNames((v) => [...v, t("Custom load", "Autre équipement")]);
            }}
          >
            + {t("Add an appliance", "Ajouter un équipement")}
          </button>
          <div className="sizing-settings">
            <label>
              {t("Productive sun hours / day", "Heures solaires utiles / jour")}
              <input
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                value={sun || ""}
                onChange={(e) => setSun(Number(e.target.value))}
              />
            </label>
            <label>
              {t("Battery autonomy", "Autonomie de la batterie")}
              <select
                value={autonomy}
                onChange={(e) => setAutonomy(Number(e.target.value))}
              >
                {[0.5, 1, 1.5, 2, 3].map((n) => (
                  <option key={n} value={n}>
                    {num(n)} {t("days", "jours")}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="sizing-result" aria-live="polite">
          <p className="eyebrow">
            {t("YOUR PLANNING ESTIMATE", "VOTRE ESTIMATION")}
          </p>
          {result.valid ? (
            <>
              <div className="main-estimate">
                <strong>{num(result.pv!)}</strong>
                <span>kWp {t("solar array", "de solaire")}</span>
              </div>
              <dl className="spec-list">
                {[
                  [
                    t("Daily energy", "Énergie quotidienne"),
                    `${num(result.daily!)} kWh`,
                  ],
                  [
                    t("Peak load", "Charge de pointe"),
                    `${num(result.peak!)} kW`,
                  ],
                  [
                    t("Inverter preset", "Palier d’onduleur"),
                    `${num(result.inverter!)} kW`,
                  ],
                  [
                    t("Battery preset", "Palier de batterie"),
                    `${num(result.battery!)} kWh`,
                  ],
                ].map(([name, value]) => (
                  <div key={name}>
                    <dt>{name}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              {result.exceedsPresets && (
                <p className="tool-alert">
                  {t(
                    "This demand exceeds the preset range. Contact us to size a larger system.",
                    "Ces besoins dépassent les paliers prédéfinis. Contactez-nous pour dimensionner un système plus important.",
                  )}
                </p>
              )}
              <Contact />
            </>
          ) : (
            <p className="tool-alert" role="alert">
              {t(
                "Enter valid non-negative values, daily usage up to 24 hours, and sun hours greater than zero.",
                "Saisissez des valeurs positives ou nulles, un usage de 24 h maximum et un ensoleillement supérieur à zéro.",
              )}
            </p>
          )}
          <p className="tool-note">
            {t(
              "Uses the original sizing method: diversified demand, 25% inverter headroom, motor surge, 90% usable battery capacity and 30% PV losses. Final design requires site assessment.",
              "Méthode d’origine : foisonnement des usages, marge onduleur de 25 %, courant de démarrage, capacité utile batterie de 90 % et pertes PV de 30 %. Une étude du site reste nécessaire.",
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
export function RoiTool() {
  const t = useT(),
    lang = useLanguage();
  const [type, setType] = useState("shop"),
    [size, setSize] = useState("medium"),
    [backup, setBackup] = useState("balanced"),
    [genset, setGenset] = useState("none"),
    [manual, setManual] = useState("");
  const recommended = recommendPlan(type, size, backup, genset);
  const selected =
    plans.find((p) => p.id === (manual || recommended)) || plans[1];
  const [overrides, setOverrides] = useState<
      Record<string, { price?: number; load?: number; generation?: number }>
    >({}),
    [dieselCost, setDieselCost] = useState(600),
    [hours, setHours] = useState(10),
    [years, setYears] = useState(10),
    [hover, setHover] = useState(0);
  const values = overrides[selected.id] || {},
    price = values.price ?? selected.price,
    load = values.load ?? selected.recLoad,
    generation = values.generation ?? selected.dailyGenMid;
  const result = calculateRoi(selected, {
    years,
    runHours: hours,
    dieselCost,
    price,
    load,
    generation,
  });
  const money = (n: number) =>
      new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-NG", {
        style: "currency",
        currency: "NGN",
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(n),
    num = (n: number) =>
      new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-GB", {
        maximumFractionDigits: 1,
      }).format(n);
  function pick(setter: (v: string) => void, value: string) {
    setter(value);
    setManual("");
  }
  function change(key: string, value: number) {
    setOverrides((current) => ({
      ...current,
      [selected.id]: { ...current[selected.id], [key]: value },
    }));
  }
  const options = [
    {
      label: t("Business type", "Type d’activité"),
      value: type,
      change: setType,
      items: [
        ["clinic", t("Clinic / Pharmacy", "Clinique / Pharmacie")],
        ["shop", t("Shop / Supermarket", "Commerce / Supermarché")],
        ["hotel", t("Hotel", "Hôtel")],
        ["restaurant", t("Restaurant", "Restaurant")],
        ["school", t("School / Church", "École / Église")],
        ["office", t("Office", "Bureau")],
        ["factory", t("Factory / Cold storage", "Usine / Chambre froide")],
        ["other", t("Other", "Autre")],
      ],
    },
    {
      label: t("Business size", "Taille de l’activité"),
      value: size,
      change: setSize,
      items: [
        ["small", t("Small", "Petite")],
        ["medium", t("Medium", "Moyenne")],
        ["large", t("Large", "Grande")],
        ["industrial", t("Industrial", "Industrielle")],
      ],
    },
    {
      label: t("Backup priority", "Priorité d’autonomie"),
      value: backup,
      change: setBackup,
      items: [
        ["daytime", t("Reduce daytime diesel", "Réduire le diesel en journée")],
        ["evening", t("Evening backup", "Secours en soirée")],
        ["night", t("Long night backup", "Longue autonomie nocturne")],
        ["balanced", t("Balanced", "Équilibrée")],
      ],
    },
    {
      label: t("Existing generator", "Groupe électrogène"),
      value: genset,
      change: setGenset,
      items: [
        ["none", t("Not sure / none", "Inconnu / aucun")],
        ["s", t("Up to 30 kVA", "Jusqu’à 30 kVA")],
        ["m", "30–100 kVA"],
        ["l", "100–250 kVA"],
        ["xl", "250 kVA +"],
      ],
    },
  ];
  const points = result.valid ? result.points! : [],
    max = result.valid
      ? Math.max(
          1,
          ...points.flatMap((p: { diesel: number; solar: number }) => [
            p.diesel,
            p.solar,
          ]),
        )
      : 1;
  const pt = (
    p: { year: number; diesel: number; solar: number },
    key: "diesel" | "solar",
  ) => `${60 + (p.year / years) * 660},${240 - (p[key] / max) * 200}`;
  const selectedYear = points[Math.min(hover, points.length - 1)];
  return (
    <div className="calculator roi-calculator" id="roi">
      <div className="calculator-heading">
        <span className="eyebrow">
          {t("NIGERIA / DIESEL COMPARISON", "NIGERIA / COMPARAISON AU DIESEL")}
        </span>
        <h3>{t("See the longer view.", "Prenez une longueur d’avance.")}</h3>
        <p>
          {t(
            "Compare upfront solar investment with cumulative diesel costs. All prices below are editable reference assumptions, not current offers.",
            "Comparez l’investissement solaire aux coûts cumulés du diesel. Les prix ci-dessous sont des hypothèses modifiables, et non des offres actuelles.",
          )}
        </p>
      </div>
      <div className="roi-questions">
        {options.map((q) => (
          <label key={q.label}>
            {q.label}
            <select
              value={q.value}
              onChange={(e) => pick(q.change, e.target.value)}
            >
              {q.items.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <label className="roi-plan-select">
        {t(
          "Suggested system — or choose another",
          "Système proposé — ou choisissez-en un autre",
        )}
        <select value={selected.id} onChange={(e) => setManual(e.target.value)}>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.shortName}
            </option>
          ))}
        </select>
      </label>
      <h4 className="selected-plan-name">{selected.name}</h4>
      <div className="roi-assumptions">
        {[
          {
            label: t("System investment (NGN)", "Investissement système (NGN)"),
            value: price,
            change: (v: number) => change("price", v),
            max: undefined,
          },
          {
            label: t("Diesel cost (NGN / kWh)", "Coût diesel (NGN / kWh)"),
            value: dieselCost,
            change: setDieselCost,
            max: undefined,
          },
          {
            label: t("Site load (kW)", "Charge du site (kW)"),
            value: load,
            change: (v: number) => change("load", v),
            max: undefined,
          },
          {
            label: t(
              "Daily solar energy (kWh)",
              "Énergie solaire quotidienne (kWh)",
            ),
            value: generation,
            change: (v: number) => change("generation", v),
            max: undefined,
          },
          {
            label: t(
              "Operation hours / day",
              "Heures de fonctionnement / jour",
            ),
            value: hours,
            change: setHours,
            max: 24,
          },
          {
            label: t(
              "Comparison period (years)",
              "Période de comparaison (années)",
            ),
            value: years,
            change: setYears,
            max: 30,
          },
        ].map((f) => (
          <label key={f.label}>
            {f.label}
            <input
              type="number"
              inputMode="decimal"
              min={f.change === setYears ? 1 : 0}
              max={f.max}
              value={Number.isNaN(f.value) ? "" : f.value}
              onChange={(e) =>
                f.change(e.target.value === "" ? NaN : Number(e.target.value))
              }
            />
          </label>
        ))}
      </div>
      {result.valid ? (
        <>
          <div className="roi-stats" aria-live="polite">
            <div>
              <span>{t("Estimated payback", "Retour estimé")}</span>
              <strong>
                {result.payback === null
                  ? t("No payback", "Aucun retour")
                  : result.payback! > years
                    ? t(`Over ${years} years`, `Plus de ${years} ans`)
                    : `${num(result.payback!)} ${t("years", "ans")}`}
              </strong>
            </div>
            <div>
              <span>
                {t("Savings over the period", "Économies sur la période")}
              </span>
              <strong>{money(result.totalSavings!)}</strong>
            </div>
            <div>
              <span>{t("Diesel-only / month", "Diesel seul / mois")}</span>
              <strong>{money(result.monthlyDiesel!)}</strong>
            </div>
          </div>
          <figure className="roi-chart">
            <figcaption>
              <span>
                <i className="legend-diesel" />
                {t("Diesel only", "Diesel seul")}
              </span>
              <span>
                <i className="legend-solar" />
                {t("Solar + residual diesel", "Solaire + diesel résiduel")}
              </span>
            </figcaption>
            <svg
              viewBox="0 0 760 280"
              role="img"
              aria-label={t(
                "Cumulative energy cost comparison",
                "Comparaison des coûts cumulés d’énergie",
              )}
            >
              {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                <g key={v}>
                  <line
                    x1="60"
                    x2="720"
                    y1={240 - v * 200}
                    y2={240 - v * 200}
                    className="chart-grid"
                  />
                  <text x="50" y={244 - v * 200} textAnchor="end">
                    {money(max * v)}
                  </text>
                </g>
              ))}
              <polyline
                points={points
                  .map((p: { year: number; diesel: number; solar: number }) =>
                    pt(p, "diesel"),
                  )
                  .join(" ")}
                className="chart-line diesel-line"
              />
              <polyline
                points={points
                  .map((p: { year: number; diesel: number; solar: number }) =>
                    pt(p, "solar"),
                  )
                  .join(" ")}
                className="chart-line solar-line"
              />
              {[0, Math.floor(years / 2), years].map((v, i) => (
                <text
                  key={i}
                  x={60 + (v / years) * 660}
                  y="269"
                  textAnchor="middle"
                >
                  {t("Year", "An")} {v}
                </text>
              ))}
            </svg>
            <label className="chart-year">
              {t("Inspect year", "Consulter l’année")} {Math.min(hover, years)}
              <input
                type="range"
                min="0"
                max={years}
                step="1"
                value={Math.min(hover, years)}
                onChange={(e) => setHover(Number(e.target.value))}
              />
            </label>
            {selectedYear && (
              <p className="chart-readout" aria-live="polite">
                {t("Diesel", "Diesel")} {money(selectedYear.diesel)}{" "}
                <span>/</span> {t("Solar", "Solaire")}{" "}
                {money(selectedYear.solar)}
              </p>
            )}
          </figure>
          <p className="tool-note">
            {t(
              "Original method: site load × operating hours × 365. Solar covers up to the daily generation assumption; diesel supplies the remaining energy. Investment is paid upfront. Financing, escalation and replacements are not modelled.",
              "Méthode d’origine : charge du site × heures de fonctionnement × 365. Le solaire couvre au maximum la production quotidienne retenue ; le diesel couvre le solde. L’investissement est payé au départ. Financement, inflation et remplacements ne sont pas modélisés.",
            )}
          </p>
        </>
      ) : (
        <p className="tool-alert" role="alert">
          {t(
            "Enter non-negative values, 0–24 operating hours and a whole comparison period of 1–30 years.",
            "Saisissez des valeurs positives ou nulles, 0 à 24 heures de fonctionnement et une période entière de 1 à 30 ans.",
          )}
        </p>
      )}
      <div className="detail-actions">
        <Contact />
        <button
          className="text-link"
          onClick={() => {
            setOverrides({});
            setDieselCost(600);
            setHours(10);
            setYears(10);
          }}
        >
          {t("Reset assumptions", "Réinitialiser les hypothèses")} ↺
        </button>
      </div>
    </div>
  );
}
