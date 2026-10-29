export const defaultLoads = [
  [6, 10, 5],
  [2, 60, 8],
  [1, 150, 8],
  [0, 200, 8],
  [1, 100, 5],
  [1, 15, 24],
  [0, 65, 4],
  [0, 1300, 6],
  [0, 900, 6],
  [0, 750, 2],
  [0, 500, 1],
  [0, 50, 24],
];
const inverterSizes = [3, 5, 8, 10, 12, 16, 20, 30, 50, 100, 200];
const batterySizes = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200];
const snap = (arr, value) => arr.find((n) => n >= value) ?? arr.at(-1);
export function calculateSizing(loads, sunHours, autonomy) {
  if (
    !Number.isFinite(sunHours) ||
    sunHours <= 0 ||
    sunHours > 24 ||
    !Number.isFinite(autonomy) ||
    autonomy < 0 ||
    !loads.every(
      (r) =>
        r.length === 3 &&
        r.every((n) => Number.isFinite(n) && n >= 0) &&
        r[2] <= 24,
    )
  )
    return { valid: false };
  let dailyWh = 0,
    bigW = 0,
    smallW = 0,
    largestW = 0;
  for (const [q, w, h] of loads) {
    dailyWh += q * w * h;
    if (w >= 500) bigW += q * w;
    else smallW += q * w;
    if (q > 0 && w > largestW) largestW = w;
  }
  const daily = dailyWh / 1000,
    peak = (bigW * 0.9 + smallW * 0.5) / 1000;
  const requestedInverter = Math.max(peak * 1.25, (largestW * 2.5) / 1000, 3),
    requestedBattery = (daily * autonomy) / 0.9;
  if (
    ![daily, peak, requestedInverter, requestedBattery].every(Number.isFinite)
  )
    return { valid: false };
  return {
    valid: true,
    daily,
    peak,
    inverter: snap(inverterSizes, requestedInverter),
    battery: snap(batterySizes, requestedBattery),
    pv: Math.ceil(((daily * 1.3) / sunHours) * 10) / 10,
    exceedsPresets: requestedInverter > 200 || requestedBattery > 200,
  };
}
export function recommendPlan(type, size, backup, genset) {
  const base = {
    clinic: 15,
    shop: 18,
    hotel: 30,
    restaurant: 20,
    school: 25,
    office: 18,
    factory: 80,
    other: 25,
  };
  const scale = { small: 0.7, medium: 1.6, large: 3.5, industrial: 7 },
    generators = { none: null, s: 24, m: 64, l: 140, xl: 300 };
  let target = (base[type] ?? 25) * (scale[size] ?? 1.6),
    g = generators[genset];
  if (g != null) target = target * 0.4 + g * 0.6;
  if (target <= 33)
    return (
      { daytime: "h60", evening: "h120", night: "h215", balanced: "h80" }[
        backup
      ] ?? "h80"
    );
  return target <= 66
    ? "h100"
    : target <= 82.5
      ? "c125"
      : target <= 100
        ? "h150"
        : target <= 165
          ? "c250"
          : target <= 247.5
            ? "c375"
            : "c500";
}
export function calculateRoi(
  plan,
  {
    years,
    runHours,
    dieselCost,
    price,
    load = plan.recLoad,
    generation = plan.dailyGenMid,
  },
) {
  if (
    !Number.isInteger(years) ||
    years < 1 ||
    years > 30 ||
    ![runHours, dieselCost, price, load, generation].every(
      (n) => Number.isFinite(n) && n >= 0,
    ) ||
    runHours > 24
  )
    return { valid: false };
  const demand = load * runHours,
    residual = Math.max(0, demand - generation),
    annualLoad = demand * 365,
    annualResidual = residual * 365;
  const annualNet = dieselCost * (annualLoad - annualResidual),
    payback = annualNet > 0 ? price / annualNet : null;
  if (
    ![
      demand,
      residual,
      annualLoad,
      annualResidual,
      annualNet,
      price + dieselCost * annualResidual * years,
      dieselCost * annualLoad * years,
    ].every(Number.isFinite)
  )
    return { valid: false };
  const points = Array.from({ length: years + 1 }, (_, year) => ({
    year,
    diesel: dieselCost * annualLoad * year,
    solar: price + dieselCost * annualResidual * year,
  }));
  return {
    valid: true,
    demand,
    residual,
    annualNet,
    payback,
    points,
    totalSavings: points.at(-1).diesel - points.at(-1).solar,
    monthlyDiesel: (dieselCost * annualLoad) / 12,
    litresDay: demand * 0.28,
  };
}
