import { Router } from "express";

const router = Router();

const events = [
  {
    id: "evt-001",
    title: "US Non-Farm Payrolls (NFP) Report",
    currency: "USD",
    date: "2025-07-04T12:30:00Z",
    impact: "High",
    highImpact: true,
    forecast: "185K",
    previous: "177K",
    description:
      "Measures the change in the number of employed people in the US, excluding the farming industry. A key indicator of economic health — big surprises can move USD pairs sharply.",
  },
  {
    id: "evt-002",
    title: "BOE Interest Rate Decision",
    currency: "GBP",
    date: "2025-07-06T11:00:00Z",
    impact: "High",
    highImpact: true,
    forecast: "5.00%",
    previous: "5.25%",
    description:
      "The Bank of England announces its benchmark interest rate. Higher rates typically strengthen GBP; lower rates can weaken it.",
  },
  {
    id: "evt-003",
    title: "ECB Press Conference",
    currency: "EUR",
    date: "2025-07-10T13:30:00Z",
    impact: "High",
    highImpact: true,
    forecast: "N/A",
    previous: "N/A",
    description:
      "European Central Bank president speaks about monetary policy outlook. Market-moving language around inflation or rate cuts can cause sharp EUR movement.",
  },
  {
    id: "evt-004",
    title: "US Consumer Price Index (CPI)",
    currency: "USD",
    date: "2025-07-11T12:30:00Z",
    impact: "High",
    highImpact: true,
    forecast: "3.1%",
    previous: "3.3%",
    description:
      "Measures inflation from the consumer's perspective. Rising CPI can pressure the Fed to keep rates high, supporting the USD.",
  },
  {
    id: "evt-005",
    title: "Germany Manufacturing PMI",
    currency: "EUR",
    date: "2025-07-08T08:30:00Z",
    impact: "Medium",
    highImpact: false,
    forecast: "47.2",
    previous: "46.8",
    description:
      "A reading above 50 signals expansion in German manufacturing; below 50 signals contraction. A leading indicator for Eurozone economic health.",
  },
  {
    id: "evt-006",
    title: "Singapore GDP Growth Rate",
    currency: "SGD",
    date: "2025-07-14T01:00:00Z",
    impact: "Medium",
    highImpact: false,
    forecast: "1.4%",
    previous: "1.1%",
    description:
      "Singapore's quarterly GDP release. Relevant to EUR/SGD traders as it reflects the health of Singapore's open, trade-dependent economy.",
  },
  {
    id: "evt-007",
    title: "US Initial Jobless Claims",
    currency: "USD",
    date: "2025-07-09T12:30:00Z",
    impact: "Low",
    highImpact: false,
    forecast: "218K",
    previous: "222K",
    description:
      "Weekly count of people filing for unemployment benefits for the first time. Lower numbers generally indicate a strong labor market.",
  },
];

router.get("/economic-calendar", (req, res) => {
  const { highImpactOnly } = req.query;

  const filtered =
    highImpactOnly === "true" ? events.filter((e) => e.highImpact) : events;

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    count: filtered.length,
    events: filtered,
  });
});

export default router;
