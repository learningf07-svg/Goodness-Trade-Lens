import { Router } from "express";

const router = Router();

function jitter(base: number, range: number): number {
  return parseFloat((base + (Math.random() * range * 2 - range)).toFixed(5));
}

function mockClosingPrices(base: number, count: number, volatility: number): number[] {
  const prices: number[] = [];
  let price = base;
  for (let i = 0; i < count; i++) {
    price = parseFloat((price + (Math.random() * volatility * 2 - volatility)).toFixed(5));
    prices.push(price);
  }
  return prices;
}

router.get("/market-data", (req, res) => {
  const pairs = [
    {
      pair: "EUR/USD",
      price: jitter(1.08542, 0.002),
      change24h: parseFloat((Math.random() * 0.6 - 0.3).toFixed(2)),
      spreadPips: parseFloat((1.1 + Math.random() * 0.9).toFixed(1)),
      closingPrices: mockClosingPrices(1.08542, 14, 0.0008),
    },
    {
      pair: "GBP/USD",
      price: jitter(1.27183, 0.002),
      change24h: parseFloat((Math.random() * 0.8 - 0.4).toFixed(2)),
      spreadPips: parseFloat((1.8 + Math.random() * 1.2).toFixed(1)),
      closingPrices: mockClosingPrices(1.27183, 14, 0.001),
    },
    {
      pair: "EUR/SGD",
      price: jitter(1.45621, 0.003),
      change24h: parseFloat((Math.random() * 0.5 - 0.25).toFixed(2)),
      spreadPips: parseFloat((2.5 + Math.random() * 1.4).toFixed(1)),
      closingPrices: mockClosingPrices(1.45621, 14, 0.0012),
    },
  ];

  res.json({ success: true, timestamp: new Date().toISOString(), data: pairs });
});

export default router;
