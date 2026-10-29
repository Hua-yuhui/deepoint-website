import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  calculateSizing,
  calculateRoi,
  defaultLoads,
  recommendPlan,
} from "../src/calculators.mjs";
const plans = JSON.parse(
  fs.readFileSync(new URL("../src/data/plans.json", import.meta.url), "utf8"),
);
function originalSizing(loads, sun, days) {
  let dailyWh = 0,
    big = 0,
    small = 0,
    largest = 0;
  for (const [q, w, h] of loads) {
    dailyWh += q * w * h;
    if (w >= 500) big += q * w;
    else small += q * w;
    if (q > 0 && w > largest) largest = w;
  }
  const snap = (a, v) => a.find((n) => n >= v) ?? a.at(-1);
  return {
    daily: dailyWh / 1000,
    peak: (big * 0.9 + small * 0.5) / 1000,
    inverter: snap(
      [3, 5, 8, 10, 12, 16, 20, 30, 50, 100, 200],
      Math.max(
        ((big * 0.9 + small * 0.5) / 1000) * 1.25,
        (largest * 2.5) / 1000,
        3,
      ),
    ),
    battery: snap(
      [5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200],
      ((dailyWh / 1000) * days) / 0.9,
    ),
    pv: Math.ceil((((dailyWh / 1000) * 1.3) / sun) * 10) / 10,
  };
}
test("sizing matches original defaults and appliance edits", () => {
  for (const [loads, sun, days] of [
    [defaultLoads, 4.5, 1],
    [defaultLoads.map((r) => r.map((v, i) => (i === 0 ? v * 2 : v))), 3, 2],
    [
      [
        [1, 1300, 6],
        [2, 750, 3],
      ],
      5,
      0.5,
    ],
  ]) {
    const actual = calculateSizing(loads, sun, days);
    assert(actual.valid);
    for (const [k, v] of Object.entries(originalSizing(loads, sun, days)))
      assert.equal(actual[k], v);
  }
});
test("zero load retains original preset behavior; oversize is flagged", () => {
  assert.equal(calculateSizing([[0, 100, 3]], 4, 1).pv, 0);
  assert.equal(calculateSizing([[0, 100, 3]], 4, 1).inverter, 3);
  assert(calculateSizing([[1000, 10000, 24]], 4, 3).exceedsPresets);
});
test("invalid inputs are rejected", () => {
  assert.equal(calculateSizing(defaultLoads, 0, 1).valid, false);
  assert.equal(calculateSizing([[1, -5, 8]], 4, 1).valid, false);
  assert.equal(calculateSizing([[1, 5, 25]], 4, 1).valid, false);
  assert.equal(calculateSizing([[NaN, 5, 8]], 4, 1).valid, false);
});
test("original plan recommendations preserved", () => {
  assert.equal(recommendPlan("shop", "medium", "balanced", "none"), "h80");
  assert.equal(recommendPlan("shop", "medium", "night", "none"), "h215");
  assert.equal(
    recommendPlan("factory", "industrial", "balanced", "xl"),
    "c500",
  );
  assert.equal(recommendPlan("clinic", "small", "daytime", "none"), "h60");
});
test("ROI matches original cost curves for all ten plans", () => {
  for (const plan of plans) {
    for (const hours of [0, 10, 24]) {
      const result = calculateRoi(plan, {
        years: 10,
        runHours: hours,
        dieselCost: 600,
        price: plan.price,
      });
      assert(result.valid);
      const demand = plan.recLoad * hours,
        residual = Math.max(0, demand - plan.dailyGenMid);
      assert.equal(result.points[10].diesel, 600 * demand * 365 * 10);
      assert.equal(
        result.points[10].solar,
        plan.price + 600 * residual * 365 * 10,
      );
      assert.equal(
        result.payback,
        demand > 0 ? plan.price / (600 * (demand - residual) * 365) : null,
      );
    }
  }
});
test("editable price and diesel assumptions affect both chart and payback", () => {
  const plan = plans[1],
    a = calculateRoi(plan, {
      years: 10,
      runHours: 10,
      dieselCost: 600,
      price: plan.price,
    }),
    b = calculateRoi(plan, {
      years: 10,
      runHours: 10,
      dieselCost: 300,
      price: plan.price * 2,
    });
  assert.equal(b.payback, a.payback * 4);
  assert.equal(b.points[0].solar, plan.price * 2);
});
test("no payback and invalid ROI states remain finite", () => {
  const p = plans[0];
  const a = calculateRoi(p, {
    years: 1,
    runHours: 0,
    dieselCost: 0,
    price: p.price,
  });
  assert.equal(a.payback, null);
  assert(a.totalSavings < 0);
  for (const values of [
    { years: 0, runHours: 10, dieselCost: 600, price: 1 },
    { years: 2.5, runHours: 10, dieselCost: 600, price: 1 },
    { years: 10, runHours: 25, dieselCost: 600, price: 1 },
    { years: 10, runHours: 10, dieselCost: -1, price: 1 },
  ])
    assert.equal(calculateRoi(p, values).valid, false);
});
