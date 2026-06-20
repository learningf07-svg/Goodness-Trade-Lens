import { useState, useEffect, useRef } from "react";
import {
  BarChart2,
  Sparkles,
  Calendar,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Delete,
  X,
  AlertTriangle,
  BookOpen,
  Zap,
  Info,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ─── Types ──────────────────────────────────────────────────────────── */
interface MarketData {
  pair: string;
  price: number;
  change24h: number;
  spreadPips: number;
  closingPrices: number[];
}

interface CalendarEvent {
  id: string;
  title: string;
  currency: string;
  date: string;
  impact: string;
  highImpact: boolean;
  forecast: string;
  previous: string;
  description: string;
}

type TabId = "market" | "ai" | "insights";

/* ─── Shared glass style ─────────────────────────────────────────────── */
const glass: React.CSSProperties = {
  background: "rgba(23, 29, 44, 0.65)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "16px",
};

/* ─── Jargon dictionary ──────────────────────────────────────────────── */
const JARGON: Record<string, string> = {
  bullish:
    "prices are consistently rising because buyers outnumber sellers",
  bearish:
    "prices are consistently falling because sellers outnumber buyers",
  overbought:
    "the asset has risen so fast that a pullback (price drop) may be coming soon",
  oversold:
    "the asset has dropped so fast that a bounce (price rise) may be coming soon",
  slippage:
    "your trade executes at a slightly different price than expected because the market moved between your click and the actual execution",
  liquidity:
    "how easily an asset can be bought or sold without drastically changing its price — high liquidity means fast, cheap trades",
  volatility:
    "how dramatically prices swing up and down — high volatility means bigger moves and bigger risks",
  resistance:
    "a price level where selling pressure tends to be strong, often stopping prices from rising further",
  support:
    "a price level where buying pressure tends to be strong, often stopping prices from falling further",
  momentum:
    "the speed and direction of a price trend — strong momentum means the trend is powerful and likely to continue",
  consolidation:
    "a period where prices move sideways without a clear direction, like a pause before the next big move",
  breakout:
    "when a price moves decisively beyond a key support or resistance level, often signalling the start of a new trend",
  pip: "the smallest standard price movement in a currency pair — for EUR/USD, one pip equals 0.0001",
  spread:
    "the tiny gap between the buy and sell price — this is how brokers earn revenue on every trade",
  leverage:
    "borrowed capital that multiplies your position size — x100 leverage means $100 controls a $10,000 trade",
  margin:
    "the deposit required to open a leveraged position — if the market moves against you, you can lose your entire margin",
};

/**
 * Post-processes an AI response string, appending inline beginner notes
 * whenever a known jargon term appears (case-insensitive, whole-word match).
 */
function annotateJargon(text: string): string {
  let result = text;
  for (const [term, explanation] of Object.entries(JARGON)) {
    const regex = new RegExp(`\\b(${term})\\b`, "gi");
    result = result.replace(regex, (match) => `${match} *(${explanation})*`);
  }
  return result;
}

/* ─── Splash Screen ──────────────────────────────────────────────────── */
const TIPS = [
  "A 'Pip' is the smallest price movement in a currency pair — just 0.0001 for EUR/USD.",
  "The 'Spread' is the cost of every trade — the gap between buying and selling price.",
  "Leverage multiplies your trade size but also multiplies your risk equally.",
  "Over 70% of retail Forex traders lose money. Always trade what you can afford to lose.",
  "Economic events like NFP and central bank decisions can move markets dramatically.",
  "A 'Bullish' market means prices are rising. 'Bearish' means prices are falling.",
  "Volatility describes how fast and unpredictably prices move — higher during news events.",
  "The best tool for a beginner is patience — wait for clarity before any decision.",
];

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [tipIndex, setTipIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Rotate tips every 2.5 s
    const tipTimer = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 2500);

    // Begin fade-out at 6 s, call onDone at 6.6 s
    const fadeTimer = setTimeout(() => setFadeOut(true), 6000);
    const doneTimer = setTimeout(() => onDone(), 6700);

    return () => {
      clearInterval(tipTimer);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <>
      {/* Keyframe styles injected inline */}
      <style>{`
        @keyframes gtl-pulse-ring {
          0%   { transform: scale(0.9); opacity: 0.6; }
          50%  { transform: scale(1.08); opacity: 0.15; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }
        @keyframes gtl-glow-text {
          0%, 100% { text-shadow: 0 0 20px rgba(0,185,122,0.5), 0 0 60px rgba(0,185,122,0.2); }
          50%       { text-shadow: 0 0 40px rgba(0,185,122,0.9), 0 0 100px rgba(0,185,122,0.4); }
        }
        @keyframes gtl-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes gtl-tip-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gtl-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8"
        style={{
          background: "#0b0f19",
          transition: "opacity 0.7s ease",
          opacity: fadeOut ? 0 : 1,
          pointerEvents: fadeOut ? "none" : "all",
          animation: "gtl-fade-in 0.5s ease forwards",
        }}
      >
        {/* Icon */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Pulsing ring */}
          <div
            className="absolute rounded-full"
            style={{
              width: "140px",
              height: "140px",
              background: "rgba(0,185,122,0.08)",
              border: "1px solid rgba(0,185,122,0.2)",
              animation: "gtl-pulse-ring 2.4s ease-in-out infinite",
            }}
          />
          <img
            src="/app-icon.png"
            alt="Goodness Trade Lens"
            width={96}
            height={96}
            style={{ borderRadius: "22px", position: "relative", zIndex: 1 }}
          />
        </div>

        {/* App name */}
        <h1
          className="font-bold text-center mb-2"
          style={{
            fontSize: "clamp(1.5rem, 6vw, 2rem)",
            color: "#00b97a",
            animation: "gtl-glow-text 2.5s ease-in-out infinite",
            letterSpacing: "-0.01em",
          }}
        >
          Goodness Trade Lens
        </h1>
        <p
          className="font-bold uppercase tracking-widest mb-10"
          style={{ fontSize: "10px", color: "#9fa6b2" }}
        >
          Educational Analytics Engine
        </p>

        {/* Spinner */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "3px solid rgba(0,185,122,0.15)",
            borderTopColor: "#00b97a",
            animation: "gtl-spin 0.9s linear infinite",
            marginBottom: "32px",
          }}
        />

        {/* Rotating tip */}
        <div
          key={tipIndex}
          className="max-w-xs text-center px-4 py-3 rounded-2xl"
          style={{
            background: "rgba(23,29,44,0.6)",
            border: "1px solid rgba(255,255,255,0.07)",
            animation: "gtl-tip-in 0.4s ease forwards",
          }}
        >
          <p
            className="font-bold uppercase tracking-widest mb-1"
            style={{ fontSize: "9px", color: "#00b97a" }}
          >
            Did you know?
          </p>
          <p
            className="leading-relaxed"
            style={{ fontSize: "clamp(0.75rem, 3vw, 0.85rem)", color: "#c4cad6" }}
          >
            {TIPS[tipIndex]}
          </p>
        </div>
      </div>
    </>
  );
}

/* ─── JargonTooltip — info icon + glassmorphic overlay ──────────────── */
function JargonTooltip({ term, definition }: { term: string; definition: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  return (
    <span className="relative inline-flex items-center" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="ml-1 inline-flex items-center justify-center rounded-full transition-colors"
        style={{ width: "16px", height: "16px", color: "#9fa6b2" }}
        aria-label={`What is ${term}?`}
        data-testid={`jargon-icon-${term}`}
      >
        <Info className="w-3 h-3" />
      </button>

      {open && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 text-left"
          style={{
            background: "rgba(11, 15, 25, 0.97)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(0,185,122,0.25)",
            borderRadius: "12px",
            boxShadow: "0 0 32px rgba(0,185,122,0.15)",
          }}
        >
          <p
            className="font-bold mb-1"
            style={{ fontSize: "11px", color: "#00b97a", textTransform: "uppercase", letterSpacing: "0.06em" }}
          >
            {term}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "#c4cad6" }}>
            {definition}
          </p>
          <button
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 p-0.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-3 h-3" style={{ color: "#9fa6b2" }} />
          </button>
        </div>
      )}
    </span>
  );
}

/* ─── Numpad Overlay ─────────────────────────────────────────────────── */
function NumpadOverlay({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
}) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "DEL"];

  const handleKey = (k: string) => {
    if (k === "DEL") {
      onChange(value.length <= 1 ? "0" : value.slice(0, -1));
      return;
    }
    if (k === "." && value.includes(".")) return;
    const next = value === "0" && k !== "." ? k : value + k;
    if (next.length > 9) return;
    onChange(next);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs mx-4 mb-4 sm:mb-0 overflow-hidden"
        style={{
          background: "rgba(11, 15, 25, 0.98)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px",
          boxShadow: "0 0 60px rgba(0,185,122,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 pt-5 pb-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <span
            className="font-bold uppercase tracking-widest"
            style={{ fontSize: "10px", color: "#9fa6b2" }}
          >
            Practice Amount
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" style={{ color: "#9fa6b2" }} />
          </button>
        </div>

        <div className="px-5 py-4 flex items-baseline gap-1.5">
          <span className="text-2xl font-medium" style={{ color: "#9fa6b2" }}>$</span>
          <span
            className="font-bold tabular-nums tracking-tight"
            style={{ fontSize: "clamp(2rem, 9vw, 2.5rem)", color: "#ffffff" }}
            data-testid="numpad-display"
          >
            {value}
          </span>
        </div>

        <div
          className="grid grid-cols-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          {keys.map((k) => (
            <button
              key={k}
              data-testid={`numpad-key-${k}`}
              onClick={() => handleKey(k)}
              className="flex items-center justify-center transition-all active:scale-95"
              style={{
                height: "56px",
                fontSize: k === "DEL" ? undefined : "1.2rem",
                fontWeight: 600,
                color: k === "DEL" ? "#ff4a4a" : "#ffffff",
                background: "transparent",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                borderRight: "1px solid rgba(255,255,255,0.05)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              {k === "DEL" ? <Delete className="w-5 h-5" /> : k}
            </button>
          ))}
        </div>

        <div className="p-4">
          <button
            data-testid="numpad-apply"
            onClick={onClose}
            className="w-full h-12 rounded-xl font-bold text-sm tracking-wider text-white transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #00b97a, #00d48c)",
              boxShadow: "0 0 24px rgba(0,185,122,0.3)",
            }}
          >
            APPLY AMOUNT
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── SVG Chart ──────────────────────────────────────────────────────── */
function ChartCanvas({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = range * 0.15;
  const yMin = min - pad;
  const yMax = max + pad;
  const yRange = yMax - yMin;
  const W = 1000;
  const H = 320;

  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - yMin) / yRange) * H,
  }));

  const lineD = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const areaD = `${lineD} L ${W},${H} L 0,${H} Z`;
  const last = pts[pts.length - 1];
  const color = positive ? "#00b97a" : "#ff4a4a";
  const gradId = positive ? "grad-pos" : "grad-neg";

  return (
    <div className="w-full h-full">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="85%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
          <filter id="glow-line">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            y1={H * ratio}
            x2={W}
            y2={H * ratio}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="8 8"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <path d={areaD} fill={`url(#${gradId})`} />
        <path
          d={lineD}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
          filter="url(#glow-line)"
        />

        <circle cx={last.x} cy={last.y} r="14" fill={color} opacity="0.1">
          <animate
            attributeName="r"
            values="10;18;10"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.1;0;0.1"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx={last.x} cy={last.y} r="5" fill={color} />
      </svg>
    </div>
  );
}

/* ─── Screen 1: Market Analytics ─────────────────────────────────────── */
function ScreenMarket({
  marketData,
  loading,
  error,
  activePair,
  setActivePair,
}: {
  marketData: MarketData[];
  loading: boolean;
  error: string | null;
  activePair: string;
  setActivePair: (p: string) => void;
}) {
  const [activePeriod, setActivePeriod] = useState("1D");
  const [investment, setInvestment] = useState("100");
  const [leverage, setLeverage] = useState("x100");
  const [showNumpad, setShowNumpad] = useState(false);

  const activeData = marketData.find((d) => d.pair === activePair) ?? marketData[0];
  const positive = (activeData?.change24h ?? 0) >= 0;
  const leverageMap: Record<string, number> = {
    x25: 25,
    x50: 50,
    x100: 100,
    x200: 200,
    x400: 400,
  };
  const multiplier = leverageMap[leverage] ?? 100;
  const investNum = parseFloat(investment) || 0;
  const estimatedProfit = (investNum * multiplier * 0.0004).toFixed(2);
  const estimatedLoss = (investNum * multiplier * 0.0004 * 0.6).toFixed(2);

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {showNumpad && (
        <NumpadOverlay
          value={investment}
          onChange={setInvestment}
          onClose={() => setShowNumpad(false)}
        />
      )}

      {/* Pair selector */}
      <div className="flex gap-2">
        {["EUR/USD", "GBP/USD", "EUR/SGD"].map((pair) => (
          <button
            key={pair}
            onClick={() => setActivePair(pair)}
            className="flex-1 py-2.5 rounded-xl font-semibold transition-all"
            style={{
              fontSize: "clamp(0.65rem, 2.8vw, 0.8rem)",
              ...(activePair === pair
                ? {
                    background: "rgba(0,185,122,0.15)",
                    color: "#00b97a",
                    border: "1px solid rgba(0,185,122,0.3)",
                    boxShadow: "0 0 16px rgba(0,185,122,0.15)",
                  }
                : {
                    ...glass,
                    color: "#9fa6b2",
                  }),
            }}
            data-testid={`tab-${pair.replace("/", "")}`}
          >
            {pair}
          </button>
        ))}
      </div>

      {/* Price header card */}
      <div style={glass} className="p-4">
        {loading ? (
          <div className="flex flex-col gap-2">
            <div
              className="h-7 w-32 rounded-lg animate-pulse"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
            <div
              className="h-5 w-48 rounded-lg animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)" }}
            />
          </div>
        ) : error ? (
          <p className="text-sm" style={{ color: "#ff4a4a" }}>
            Failed to load data: {error}
          </p>
        ) : activeData ? (
          <div className="flex items-start justify-between gap-3">
            <div>
              <p
                className="font-bold mb-1"
                style={{
                  fontSize: "clamp(0.7rem, 3vw, 0.85rem)",
                  color: "#9fa6b2",
                  letterSpacing: "0.08em",
                }}
              >
                {activeData.pair}
              </p>
              <p
                className="font-bold tabular-nums text-white leading-none mb-2"
                style={{ fontSize: "clamp(1.6rem, 7vw, 2.25rem)" }}
                data-testid="price-display"
              >
                {activeData.price.toFixed(5)}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="flex items-center gap-1 font-semibold"
                  style={{
                    fontSize: "clamp(0.75rem, 3vw, 0.9rem)",
                    color: positive ? "#00b97a" : "#ff4a4a",
                  }}
                  data-testid="change-display"
                >
                  {positive ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  {Math.abs(activeData.change24h).toFixed(2)}% (24h)
                </span>
                <span className="flex items-center text-xs font-medium" style={{ color: "#9fa6b2" }}>
                  Spread
                  <JargonTooltip
                    term="Spread"
                    definition="The tiny gap between the buy price and sell price for a currency pair. Brokers earn their fee through this gap — a smaller spread means cheaper trading costs for you."
                  />
                  : <span className="text-white font-semibold ml-1">{activeData.spreadPips.toFixed(1)}</span> pips
                  <JargonTooltip
                    term="Pips"
                    definition="'Pip' stands for 'percentage in point' — the smallest standard price movement in Forex. For EUR/USD, one pip = 0.0001. If the price moves from 1.08500 to 1.08510, that's one pip."
                  />
                </span>
              </div>
            </div>
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0"
              style={{
                background: "rgba(0,185,122,0.1)",
                border: "1px solid rgba(0,185,122,0.2)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: "#00b97a" }}
              />
              <span
                className="font-bold uppercase tracking-widest"
                style={{ fontSize: "10px", color: "#00b97a" }}
              >
                Live
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Chart card */}
      <div style={{ ...glass, overflow: "hidden" }}>
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <span
            className="font-bold uppercase tracking-widest"
            style={{ fontSize: "10px", color: "#9fa6b2" }}
          >
            Price Movement
          </span>
          <div className="flex gap-1">
            {["5s", "1m", "1D", "1W"].map((p) => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className="px-2.5 py-1 font-bold rounded-md transition-colors uppercase"
                style={{
                  fontSize: "10px",
                  ...(activePeriod === p
                    ? { background: "rgba(255,255,255,0.12)", color: "#ffffff" }
                    : { color: "#9fa6b2" }),
                }}
                data-testid={`period-${p}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: "200px" }}>
          {loading || !activeData ? (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ color: "#9fa6b2" }}
            >
              <span className="text-sm animate-pulse">Loading chart…</span>
            </div>
          ) : (
            <ChartCanvas data={activeData.closingPrices} positive={positive} />
          )}
        </div>
      </div>

      {/* Practice Position Calculator */}
      <div style={glass} className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div
            className="p-1.5 rounded-lg"
            style={{ background: "rgba(0,185,122,0.12)" }}
          >
            <BookOpen className="w-3.5 h-3.5" style={{ color: "#00b97a" }} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-white">
            Practice Position Calculator
          </span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "#9fa6b2" }}>
          Adjust the values below to understand how investment size and leverage
          affect your potential outcome. For learning only — no real money is
          involved.
        </p>

        {/* Investment input */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "#9fa6b2" }}
          >
            Practice Amount
          </label>
          <div
            className="flex rounded-xl overflow-hidden"
            style={{
              background: "rgba(11,15,25,0.8)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <button
              className="w-12 flex items-center justify-center text-lg font-medium transition-colors"
              style={{
                color: "#9fa6b2",
                borderRight: "1px solid rgba(255,255,255,0.08)",
              }}
              onClick={() =>
                setInvestment(
                  String(Math.max(1, parseFloat(investment) - 10))
                )
              }
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.color = "#ffffff")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.color = "#9fa6b2")
              }
              data-testid="btn-investment-decrease"
            >
              −
            </button>
            <button
              className="flex-1 flex items-center justify-center py-3.5 transition-colors"
              onClick={() => setShowNumpad(true)}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.04)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  "transparent")
              }
              data-testid="btn-investment-field"
            >
              <span className="text-xl font-bold tabular-nums text-white">
                ${parseFloat(investment).toFixed(2)}
              </span>
            </button>
            <button
              className="w-12 flex items-center justify-center text-lg font-medium transition-colors"
              style={{
                color: "#9fa6b2",
                borderLeft: "1px solid rgba(255,255,255,0.08)",
              }}
              onClick={() =>
                setInvestment(String(parseFloat(investment) + 10))
              }
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.color = "#ffffff")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.color = "#9fa6b2")
              }
              data-testid="btn-investment-increase"
            >
              +
            </button>
          </div>
        </div>

        {/* Leverage selector */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center text-[10px] font-bold uppercase tracking-wider" style={{ color: "#9fa6b2" }}>
            Leverage
            <JargonTooltip
              term="Leverage"
              definition="Leverage lets you control a much larger trade than the amount you deposit. For example, x100 means your $100 deposit controls a $10,000 trade. Both profits AND losses are multiplied — use it carefully."
            />
            &nbsp;(multiplier)
          </label>
          <div className="flex gap-1.5">
            {["x25", "x50", "x100", "x200", "x400"].map((lev) => (
              <button
                key={lev}
                onClick={() => setLeverage(lev)}
                className="flex-1 py-2 text-[11px] font-semibold rounded-lg transition-all"
                style={
                  leverage === lev
                    ? {
                        background: "rgba(0,185,122,0.15)",
                        color: "#00b97a",
                        border: "1px solid rgba(0,185,122,0.3)",
                      }
                    : {
                        background: "rgba(11,15,25,0.8)",
                        color: "#9fa6b2",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }
                }
                data-testid={`leverage-${lev}`}
              >
                {lev}
              </button>
            ))}
          </div>
          <p className="text-[10px] mt-0.5" style={{ color: "#9fa6b2" }}>
            {leverage} means your ${investNum.toFixed(0)} controls a $
            {(investNum * multiplier).toLocaleString()} position.
          </p>
        </div>

        {/* Estimated outcome */}
        <div className="grid grid-cols-2 gap-2">
          <div
            className="rounded-xl p-3 flex flex-col gap-0.5"
            style={{
              background: "rgba(0,185,122,0.08)",
              border: "1px solid rgba(0,185,122,0.15)",
            }}
          >
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "#00b97a" }}
            >
              Estimated Gain
            </span>
            <span
              className="text-lg font-bold tabular-nums"
              style={{ color: "#00b97a" }}
            >
              +${estimatedProfit}
            </span>
          </div>
          <div
            className="rounded-xl p-3 flex flex-col gap-0.5"
            style={{
              background: "rgba(255,74,74,0.08)",
              border: "1px solid rgba(255,74,74,0.15)",
            }}
          >
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "#ff4a4a" }}
            >
              Estimated Loss
            </span>
            <span
              className="text-lg font-bold tabular-nums"
              style={{ color: "#ff4a4a" }}
            >
              −${estimatedLoss}
            </span>
          </div>
        </div>

        <div
          className="flex gap-2 p-3 rounded-xl"
          style={{
            background: "rgba(255,74,74,0.06)",
            border: "1px solid rgba(255,74,74,0.12)",
          }}
        >
          <AlertTriangle
            className="w-3.5 h-3.5 mt-0.5 shrink-0"
            style={{ color: "#ff4a4a" }}
          />
          <p className="text-[10px] leading-relaxed" style={{ color: "#ff7070" }}>
            Higher leverage amplifies both gains and losses equally. Over 70% of
            retail Forex traders lose money. This simulation is for educational
            purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Screen 2: AI Trade Lens ────────────────────────────────────────── */
function ScreenAI({
  activePair,
  marketData,
  calendarEvents,
}: {
  activePair: string;
  marketData: MarketData[];
  calendarEvents: CalendarEvent[];
}) {
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [annotated, setAnnotated] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [customCondition, setCustomCondition] = useState("");

  const activeData = marketData.find((d) => d.pair === activePair) ?? marketData[0];

  /** Build a rich technical condition payload enriched with calendar flags */
  const buildCondition = (override?: string): string => {
    if (override?.trim()) return override.trim();
    if (!activeData) return "";

    const direction =
      activeData.change24h > 0.5
        ? "rising (buyers appear to dominate)"
        : activeData.change24h < -0.5
        ? "falling (sellers appear to dominate)"
        : "relatively flat (no clear direction)";

    // Find high-impact events whose currency matches the active pair
    const pairCurrencies = activePair.split("/");
    const relevantEvents = calendarEvents.filter(
      (e) => e.highImpact && pairCurrencies.includes(e.currency)
    );
    const calendarFlag =
      relevantEvents.length > 0
        ? ` Upcoming high-impact events that may cause volatility: ${relevantEvents
            .map((e) => `${e.title} (${e.currency})`)
            .join(", ")}.`
        : " No high-impact calendar events are currently flagged for this pair.";

    return (
      `The current price of ${activePair} is ${activeData.price.toFixed(5)}. ` +
      `Over the last 24 hours it has moved ${activeData.change24h > 0 ? "+" : ""}${activeData.change24h.toFixed(2)}%, ` +
      `meaning the price is ${direction}. ` +
      `The current bid-ask spread is ${activeData.spreadPips.toFixed(1)} pips.` +
      calendarFlag
    );
  };

  const runAnalysis = async (override?: string) => {
    if (!activeData) return;
    const technicalCondition = buildCondition(override);

    try {
      setAiLoading(true);
      setAiError(null);
      setAiResponse(null);
      setAnnotated(null);

      const res = await fetch("/api/ai-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currencyPair: activePair,
          technicalCondition,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Analysis failed");

      const raw: string = data.analysis ?? "";
      setAiResponse(raw);
      setAnnotated(annotateJargon(raw));
    } catch (err: unknown) {
      setAiError(
        err instanceof Error ? err.message : "Unknown error occurred."
      );
    } finally {
      setAiLoading(false);
    }
  };

  /** Render the AI text: terms wrapped in *(...)* become styled inline notes */
  const renderAnnotated = (text: string) => {
    const parts = text.split(/(\*\([^)]+\)\*)/g);
    return parts.map((part, i) => {
      const match = part.match(/^\*\((.+)\)\*$/);
      if (match) {
        return (
          <span
            key={i}
            className="italic"
            style={{ color: "#818cf8", fontSize: "0.78em" }}
          >
            {" "}({match[1]})
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {/* Header card */}
      <div
        className="p-5 rounded-2xl flex flex-col gap-3"
        style={{
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(23,29,44,0.65) 100%)",
          border: "1px solid rgba(99,102,241,0.25)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl"
            style={{
              background: "rgba(99,102,241,0.2)",
              border: "1px solid rgba(99,102,241,0.3)",
            }}
          >
            <Sparkles className="w-5 h-5" style={{ color: "#818cf8" }} />
          </div>
          <div>
            <h2
              className="font-bold text-white"
              style={{ fontSize: "clamp(1rem, 4vw, 1.15rem)" }}
            >
              AI Trade Lens
            </h2>
            <p className="text-[11px]" style={{ color: "#9fa6b2" }}>
              Powered by OpenRouter · Educational use only
            </p>
          </div>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "#c4cad6" }}>
          Tap below to receive a plain-English breakdown of the current{" "}
          <strong className="text-white">{activePair}</strong> market conditions,
          including relevant economic calendar risks — written specifically for
          beginners.
        </p>

        {/* Active pair badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium" style={{ color: "#9fa6b2" }}>
            Analyzing:
          </span>
          <span
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: "rgba(0,185,122,0.12)",
              color: "#00b97a",
              border: "1px solid rgba(0,185,122,0.25)",
            }}
          >
            {activePair}
          </span>
          {activeData && (
            <span
              className="text-xs tabular-nums font-medium"
              style={{ color: "#ffffff" }}
            >
              @ {activeData.price.toFixed(5)}
            </span>
          )}
          {(() => {
            const pairCurrencies = activePair.split("/");
            const flags = calendarEvents.filter(
              (e) => e.highImpact && pairCurrencies.includes(e.currency)
            );
            return flags.length > 0 ? (
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{
                  background: "rgba(255,74,74,0.1)",
                  color: "#ff4a4a",
                  border: "1px solid rgba(255,74,74,0.2)",
                }}
              >
                <AlertTriangle className="w-2.5 h-2.5" />
                {flags.length} high-impact event{flags.length > 1 ? "s" : ""}
              </span>
            ) : null;
          })()}
        </div>
      </div>

      {/* Primary CTA */}
      <button
        onClick={() => runAnalysis()}
        disabled={aiLoading || !activeData}
        className="w-full rounded-2xl font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          height: "62px",
          fontSize: "clamp(0.9rem, 3.5vw, 1rem)",
          letterSpacing: "0.04em",
          background: aiLoading
            ? "rgba(99,102,241,0.4)"
            : "linear-gradient(135deg, #4f46e5, #6366f1)",
          boxShadow: aiLoading ? "none" : "0 0 32px rgba(99,102,241,0.3)",
        }}
        data-testid="btn-ai-breakdown"
      >
        {aiLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span
              className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block"
            />
            Analyzing Market…
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" />
            Run AI Market Breakdown
          </span>
        )}
      </button>

      {/* Custom condition */}
      <div style={glass} className="p-4 flex flex-col gap-3">
        <label
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "#9fa6b2" }}
        >
          Or describe a custom condition
        </label>
        <textarea
          value={customCondition}
          onChange={(e) => setCustomCondition(e.target.value)}
          placeholder="e.g. RSI at 74, price near a key resistance zone, strong upward momentum…"
          rows={3}
          className="w-full rounded-xl p-3 text-sm resize-none outline-none transition-all"
          style={{
            background: "rgba(11,15,25,0.8)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#ffffff",
            lineHeight: "1.6",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")
          }
          data-testid="input-ai-condition"
        />
        <button
          onClick={() => runAnalysis(customCondition)}
          disabled={aiLoading || !customCondition.trim()}
          className="w-full h-10 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          style={{
            background: "rgba(99,102,241,0.7)",
            border: "1px solid rgba(99,102,241,0.4)",
          }}
          data-testid="btn-analyze-custom"
        >
          Analyze Custom Condition
        </button>
      </div>

      {/* Error state */}
      {aiError && (
        <div
          className="p-4 rounded-2xl flex gap-3"
          style={{
            background: "rgba(255,74,74,0.08)",
            border: "1px solid rgba(255,74,74,0.2)",
          }}
        >
          <AlertTriangle
            className="w-4 h-4 shrink-0 mt-0.5"
            style={{ color: "#ff4a4a" }}
          />
          <p className="text-sm leading-relaxed" style={{ color: "#ff7070" }}>
            {aiError}
          </p>
        </div>
      )}

      {/* AI response */}
      {annotated && (
        <div style={glass} className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#818cf8" }} />
            <span
              className="font-bold uppercase tracking-widest"
              style={{ fontSize: "10px", color: "#818cf8" }}
            >
              AI Analysis — {activePair}
            </span>
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "#d1d6e0", whiteSpace: "pre-wrap" }}
            data-testid="ai-response"
          >
            {renderAnnotated(annotated)}
          </p>

          {/* Jargon legend note */}
          <p
            className="text-[10px] italic"
            style={{ color: "#9fa6b2", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "8px" }}
          >
            <span style={{ color: "#818cf8" }}>Italicised purple text</span> in
            brackets are plain-English explanations for trading terms automatically
            identified by the Jargon Decoder.
          </p>

          {/* Permanent disclaimer */}
          <div
            className="flex gap-2 p-3 rounded-xl mt-1"
            style={{
              background: "rgba(255,74,74,0.07)",
              border: "1px solid rgba(255,74,74,0.15)",
            }}
          >
            <AlertTriangle
              className="w-3.5 h-3.5 shrink-0 mt-0.5"
              style={{ color: "#ff4a4a" }}
            />
            <p className="text-[10px] leading-relaxed" style={{ color: "#ff7070" }}>
              Goodness Trade Lens does not execute trades or guarantee future
              performance. This analysis is purely for foundational educational
              training.
            </p>
          </div>
        </div>
      )}

      {/* Permanent disclaimer always visible at bottom */}
      <div
        className="p-3 rounded-xl flex gap-2"
        style={{
          background: "rgba(23,29,44,0.4)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <AlertTriangle
          className="w-3.5 h-3.5 shrink-0 mt-0.5"
          style={{ color: "#9fa6b2" }}
        />
        <p className="text-[10px] leading-relaxed" style={{ color: "#9fa6b2" }}>
          Goodness Trade Lens does not execute trades or guarantee future
          performance. This analysis is purely for foundational educational
          training. Trading involves extreme risk of capital loss.
        </p>
      </div>
    </div>
  );
}

/* ─── Screen 3: Economic Insights & Glossary ─────────────────────────── */
function ScreenInsights({
  calendarEvents,
  calendarLoading,
  calendarError,
}: {
  calendarEvents: CalendarEvent[];
  calendarLoading: boolean;
  calendarError: string | null;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const impactStyle = (impact: string) => {
    if (impact === "High")
      return {
        color: "#ff4a4a",
        bg: "rgba(255,74,74,0.1)",
        border: "rgba(255,74,74,0.25)",
      };
    if (impact === "Medium")
      return {
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.1)",
        border: "rgba(245,158,11,0.25)",
      };
    return {
      color: "#9fa6b2",
      bg: "rgba(255,255,255,0.06)",
      border: "rgba(255,255,255,0.12)",
    };
  };

  const formatDate = (iso: string) => {
    try {
      return (
        new Date(iso).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC",
        }) + " UTC"
      );
    } catch {
      return iso;
    }
  };

  const glossary = [
    {
      term: "Spread",
      def: "The gap between the buy and sell price. This is how brokers earn — a tighter spread costs you less per trade.",
    },
    {
      term: "Leverage",
      def: "Borrowed power that multiplies your trade size. x100 means $100 controls a $10,000 position — amplifying both gains and losses equally.",
    },
    {
      term: "Pip",
      def: "The smallest standard price move (0.0001 for most pairs). EUR/USD moving from 1.08500 to 1.08510 is 1 pip.",
    },
    {
      term: "NFP (Non-Farm Payrolls)",
      def: "A monthly US jobs report. Big surprises above or below forecast trigger sharp, fast moves in USD pairs.",
    },
    {
      term: "Interest Rate Decision",
      def: "Central banks set base rates. Higher rates attract foreign capital and typically strengthen a currency.",
    },
    {
      term: "Volatility",
      def: "How rapidly and unpredictably prices swing. High-impact calendar events dramatically increase volatility.",
    },
    {
      term: "Candlestick",
      def: "A chart shape showing a time period's open, high, low, and close price. Green (or white) means the price rose; red (or black) means it fell.",
    },
    {
      term: "Margin",
      def: "The deposit required to open a leveraged trade. If the market moves sharply against you, your margin can be wiped out.",
    },
  ];

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {/* Header */}
      <div style={glass} className="p-4 flex items-center gap-3">
        <div
          className="p-2 rounded-xl"
          style={{
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.2)",
          }}
        >
          <Calendar className="w-4 h-4" style={{ color: "#f59e0b" }} />
        </div>
        <div>
          <h2
            className="font-bold text-white"
            style={{ fontSize: "clamp(0.95rem, 3.5vw, 1.1rem)" }}
          >
            Economic Insights
          </h2>
          <p className="text-[11px]" style={{ color: "#9fa6b2" }}>
            Key events that move currency markets · tap to expand
          </p>
        </div>
      </div>

      {/* Events */}
      {calendarLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} style={glass} className="p-4">
              <div
                className="h-5 w-3/4 rounded animate-pulse mb-2"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
              <div
                className="h-3 w-1/2 rounded animate-pulse"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
            </div>
          ))}
        </div>
      ) : calendarError ? (
        <div
          className="p-4 rounded-2xl"
          style={{
            background: "rgba(255,74,74,0.08)",
            border: "1px solid rgba(255,74,74,0.2)",
          }}
        >
          <p className="text-sm" style={{ color: "#ff7070" }}>
            {calendarError}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {calendarEvents.map((ev) => {
            const ic = impactStyle(ev.impact);
            const open = expanded === ev.id;
            return (
              <button
                key={ev.id}
                onClick={() => setExpanded(open ? null : ev.id)}
                className="text-left transition-all active:scale-[0.99]"
                style={{
                  ...glass,
                  padding: "14px 16px",
                  ...(open ? { border: `1px solid ${ic.border}` } : {}),
                }}
                data-testid={`event-${ev.id}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p
                    className="font-semibold text-white leading-snug flex-1"
                    style={{ fontSize: "clamp(0.8rem, 3vw, 0.9rem)" }}
                  >
                    {ev.title}
                  </p>
                  <span
                    className="shrink-0 font-bold px-2 py-0.5 rounded-full"
                    style={{
                      fontSize: "10px",
                      background: ic.bg,
                      color: ic.color,
                      border: `1px solid ${ic.border}`,
                    }}
                  >
                    {ev.impact}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="font-bold px-2 py-0.5 rounded"
                    style={{
                      fontSize: "10px",
                      background: "rgba(255,255,255,0.06)",
                      color: "#9fa6b2",
                    }}
                  >
                    {ev.currency}
                  </span>
                  <span style={{ fontSize: "10px", color: "#9fa6b2" }}>
                    {formatDate(ev.date)}
                  </span>
                  {ev.forecast !== "N/A" && (
                    <span style={{ fontSize: "10px", color: "#9fa6b2" }}>
                      Forecast:{" "}
                      <span className="text-white font-medium">{ev.forecast}</span>
                    </span>
                  )}
                  {ev.previous !== "N/A" && (
                    <span style={{ fontSize: "10px", color: "#9fa6b2" }}>
                      Prev:{" "}
                      <span className="text-white font-medium">{ev.previous}</span>
                    </span>
                  )}
                </div>
                {open && (
                  <p
                    className="text-xs leading-relaxed mt-3 pt-3"
                    style={{
                      color: "#c4cad6",
                      borderTop: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    {ev.description}
                  </p>
                )}
                <p
                  className="mt-2"
                  style={{ fontSize: "10px", color: ic.color }}
                >
                  {open ? "Tap to collapse ▲" : "Tap for explanation ▼"}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Glossary */}
      <div style={glass} className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" style={{ color: "#00b97a" }} />
          <span className="text-xs font-bold uppercase tracking-widest text-white">
            Beginner Glossary
          </span>
        </div>
        <div className="flex flex-col gap-4">
          {glossary.map((g) => (
            <div key={g.term}>
              <p
                className="font-bold mb-1"
                style={{ fontSize: "12px", color: "#00b97a" }}
              >
                {g.term}
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#9fa6b2" }}
              >
                {g.def}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Root Dashboard ─────────────────────────────────────────────────── */
export default function Dashboard() {
  const [showSplash, setShowSplash] = useState(true);

  // PWA install prompt
  const deferredPromptRef = useRef<Event & { prompt: () => Promise<void> } | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as Event & { prompt: () => Promise<void> };
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPromptRef.current) return;
    await deferredPromptRef.current.prompt();
    deferredPromptRef.current = null;
    setShowInstall(false);
  };

  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [marketLoading, setMarketLoading] = useState(true);
  const [marketError, setMarketError] = useState<string | null>(null);

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  const [activePair, setActivePair] = useState("EUR/USD");
  const [activeTab, setActiveTab] = useState<TabId>("market");

  /* Fetch market data */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/market-data");
        if (!res.ok) throw new Error("Failed to fetch market data");
        const data = await res.json();
        setMarketData(data.data ?? []);
      } catch (err: unknown) {
        setMarketError(
          err instanceof Error ? err.message : "An error occurred"
        );
      } finally {
        setMarketLoading(false);
      }
    };
    load();
  }, []);

  /* Fetch calendar — needed by AI screen for volatility flags */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/economic-calendar");
        if (!res.ok) throw new Error("Failed to load calendar");
        const data = await res.json();
        setCalendarEvents(data.events ?? []);
      } catch (err: unknown) {
        setCalendarError(
          err instanceof Error ? err.message : "Unknown error"
        );
      } finally {
        setCalendarLoading(false);
      }
    };
    load();
  }, []);

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "market", label: "Markets", icon: <BarChart2 className="w-5 h-5" /> },
    { id: "ai", label: "AI Lens", icon: <Sparkles className="w-5 h-5" /> },
    { id: "insights", label: "Insights", icon: <Calendar className="w-5 h-5" /> },
  ];

  return (
    <div
      className="flex flex-col min-h-[100dvh] w-full overflow-x-hidden"
      style={{ background: "#0b0f19", fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Splash Screen ────────────────────────────────────────────── */}
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}

      {/* ── Top Header ────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-4 shrink-0"
        style={{
          background: "rgba(11,15,25,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          height: "clamp(50px, 10vw, 60px)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #00b97a, #00d48c)",
              boxShadow: "0 0 12px rgba(0,185,122,0.4)",
            }}
          >
            <BarChart2 className="w-4 h-4 text-white" />
          </div>
          <span
            className="font-bold text-white tracking-tight"
            style={{ fontSize: "clamp(0.8rem, 3.5vw, 1rem)" }}
          >
            Goodness Trade Lens
          </span>
          <span
            className="hidden sm:inline-flex items-center font-bold px-2 py-0.5 rounded-full"
            style={{
              fontSize: "9px",
              background: "rgba(245,158,11,0.1)",
              color: "#f59e0b",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            EDU BETA
          </span>
        </div>

        {/* Install App button — only shown when PWA prompt is available */}
        {showInstall && (
          <button
            onClick={handleInstall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all active:scale-95 shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(0,185,122,0.18), rgba(0,185,122,0.08))",
              border: "1px solid rgba(0,185,122,0.35)",
              color: "#00b97a",
              fontSize: "clamp(0.65rem, 2.5vw, 0.75rem)",
              boxShadow: "0 0 12px rgba(0,185,122,0.15)",
            }}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        )}

        {/* Practice balance */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl outline-none transition-colors shrink-0"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            data-testid="account-dropdown"
          >
            <div className="flex flex-col items-end">
              <span
                className="uppercase tracking-widest font-medium"
                style={{ fontSize: "9px", color: "#9fa6b2" }}
              >
                Practice
              </span>
              <span
                className="font-bold tabular-nums"
                style={{
                  color: "#f59e0b",
                  fontSize: "clamp(0.7rem, 3vw, 0.85rem)",
                }}
              >
                $9,384.57
              </span>
            </div>
            <ChevronDown className="w-3 h-3" style={{ color: "#9fa6b2" }} />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[200px]"
            style={{
              background: "rgba(11,15,25,0.98)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
            }}
          >
            <DropdownMenuItem className="flex justify-between cursor-pointer focus:bg-white/5 rounded-lg">
              <span className="text-sm text-white">Practice Account</span>
              <span className="text-sm font-bold" style={{ color: "#f59e0b" }}>
                $9,384.57
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex justify-between cursor-pointer focus:bg-white/5 rounded-lg">
              <span className="text-sm text-white">Real Account</span>
              <span className="text-sm font-bold text-white">₦21,315.67</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* ── Scrollable Content ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: "76px" }}>
        {activeTab === "market" && (
          <ScreenMarket
            marketData={marketData}
            loading={marketLoading}
            error={marketError}
            activePair={activePair}
            setActivePair={setActivePair}
          />
        )}
        {activeTab === "ai" && (
          <ScreenAI
            activePair={activePair}
            marketData={marketData}
            calendarEvents={calendarEvents}
          />
        )}
        {activeTab === "insights" && (
          <ScreenInsights
            calendarEvents={calendarEvents}
            calendarLoading={calendarLoading}
            calendarError={calendarError}
          />
        )}
      </div>

      {/* ── Bottom Tab Bar ─────────────────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 flex items-center"
        style={{
          background: "rgba(11,15,25,0.96)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          height: "68px",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex-1 flex flex-col items-center justify-center gap-1 transition-all"
              style={{ color: active ? "#00b97a" : "#9fa6b2", height: "100%" }}
              data-testid={`tab-nav-${tab.id}`}
            >
              {active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
                  style={{
                    width: "32px",
                    height: "2px",
                    background: "#00b97a",
                    boxShadow: "0 0 12px rgba(0,185,122,0.5)",
                  }}
                />
              )}
              <span
                style={
                  active
                    ? { filter: "drop-shadow(0 0 6px rgba(0,185,122,0.6))" }
                    : {}
                }
              >
                {tab.icon}
              </span>
              <span
                className="font-semibold"
                style={{
                  fontSize: "clamp(0.6rem, 2.2vw, 0.7rem)",
                  letterSpacing: "0.04em",
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
