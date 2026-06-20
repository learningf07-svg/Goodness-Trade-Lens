import { useState, useEffect, useRef } from "react";
import {
  BarChart2,
  Activity,
  Calendar,
  Settings,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ChevronDown,
  Delete,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface MarketData {
  pair: string;
  price: number;
  change24h: number;
  spreadPips: number;
  closingPrices: number[];
}

/* ─── Numeric Keypad Overlay ─────────────────────────────────────────── */
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
    if (next.length > 10) return;
    onChange(next);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm mx-4 mb-4 sm:mb-0 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        style={{ background: "#1c2438" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Display */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-white/10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#9fa6b2]">
            Investment Amount
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9fa6b2] hover:text-white hover:bg-white/10 transition-colors"
            data-testid="numpad-close-x"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-4 flex items-baseline gap-1">
          <span className="text-2xl font-medium text-[#9fa6b2]">$</span>
          <span
            className="text-4xl font-bold text-white tabular-nums tracking-tight"
            data-testid="numpad-display"
          >
            {value}
          </span>
        </div>

        {/* Keys */}
        <div className="grid grid-cols-3 gap-px bg-white/5 border-t border-white/10">
          {keys.map((k) => (
            <button
              key={k}
              data-testid={`numpad-key-${k}`}
              onClick={() => handleKey(k)}
              className={`flex items-center justify-center h-14 text-lg font-semibold transition-all active:scale-95 ${
                k === "DEL"
                  ? "text-[#ff4a4a] hover:bg-[#ff4a4a]/10"
                  : "text-white hover:bg-white/10"
              }`}
              style={{ background: "#171d2c" }}
            >
              {k === "DEL" ? <Delete className="w-5 h-5" /> : k}
            </button>
          ))}
        </div>

        {/* Apply */}
        <div className="p-4 border-t border-white/10" style={{ background: "#171d2c" }}>
          <button
            data-testid="numpad-apply"
            onClick={onClose}
            className="w-full h-12 rounded-xl font-bold text-sm tracking-wider text-white transition-all active:scale-95 hover:opacity-90"
            style={{ background: "#00b97a" }}
          >
            APPLY
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── SVG Chart ──────────────────────────────────────────────────────── */
function ChartCanvas({ data }: { data: number[] }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = range * 0.12;
  const yMin = min - padding;
  const yMax = max + padding;
  const yRange = yMax - yMin;

  const W = 1000;
  const H = 400;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - yMin) / yRange) * H;
    return { x, y };
  });

  const lineD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");
  const areaD = `${lineD} L ${W},${H} L 0,${H} Z`;
  const last = pts[pts.length - 1];

  return (
    <div className="w-full h-full">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00b97a" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#00b97a" stopOpacity="0" />
          </linearGradient>
          <filter id="lineGlow" x="-10%" y="-50%" width="120%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="0" y1={(H / 4) * i}
            x2={W} y2={(H / 4) * i}
            stroke="rgba(255,255,255,0.06)"
            strokeDasharray="6 6"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <path d={areaD} fill="url(#areaGrad)" />
        <path
          d={lineD}
          fill="none"
          stroke="#00b97a"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
          filter="url(#lineGlow)"
        />
        <circle cx={last.x} cy={last.y} r="5" fill="#00b97a" opacity="0.9">
          <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.8s" repeatCount="indefinite" />
        </circle>
        <circle cx={last.x} cy={last.y} r="12" fill="#00b97a" opacity="0.15">
          <animate attributeName="r" values="8;16;8" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.15;0;0.15" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────────────── */
export default function Dashboard() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activePair, setActivePair] = useState("EUR/USD");
  const [activePeriod, setActivePeriod] = useState("1D");
  const [activeLeverage, setActiveLeverage] = useState("x100");

  const [investment, setInvestment] = useState("100");
  const [showNumpad, setShowNumpad] = useState(false);

  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/market-data");
        if (!res.ok) throw new Error("Failed to fetch market data");
        const data = await res.json();
        setMarketData(data.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchMarketData();
  }, []);

  const handleAiAnalyze = async () => {
    if (!aiInput.trim()) return;
    try {
      setAiLoading(true);
      setAiResponse(null);
      const res = await fetch("/api/ai-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currencyPair: activePair, technicalCondition: aiInput }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setAiResponse(data.analysis || "No response received.");
    } catch (err: unknown) {
      setAiResponse(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setAiLoading(false);
    }
  };

  const activeData = marketData.find((d) => d.pair === activePair) ?? marketData[0];

  const navItems = [
    { icon: <BarChart2 className="w-5 h-5" />, label: "Assets", id: "nav-assets", active: true },
    { icon: <Activity className="w-5 h-5" />, label: "Indicators", id: "nav-indicators", active: false },
    { icon: <Calendar className="w-5 h-5" />, label: "Calendar", id: "nav-calendar", active: false },
    { icon: <Settings className="w-5 h-5" />, label: "Settings", id: "nav-settings", active: false },
  ];

  const formatInvestment = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) ? "0.00" : n.toFixed(2);
  };

  return (
    <div
      className="flex flex-col min-h-[100dvh] w-full bg-[#111622] text-white font-sans overflow-x-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Numpad Overlay ─────────────────────────────────────────────── */}
      {showNumpad && (
        <NumpadOverlay
          value={investment}
          onChange={setInvestment}
          onClose={() => setShowNumpad(false)}
        />
      )}

      {/* ── Top Navigation Bar ─────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 w-full flex items-center justify-between px-4 md:px-6 border-b shrink-0"
        style={{
          background: "#171d2c",
          borderColor: "rgba(255,255,255,0.08)",
          height: "clamp(52px, 8vw, 64px)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="font-bold text-white tracking-tight"
            style={{ fontSize: "clamp(0.85rem, 3.5vw, 1.1rem)" }}
          >
            Goodness Trade Lens
          </span>
          <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border"
            style={{ color: "#f59e0b", background: "rgba(245,158,11,0.1)", borderColor: "rgba(245,158,11,0.2)" }}>
            EDU BETA
          </span>
        </div>

        {/* Pair Tabs — center */}
        <nav className="flex items-center gap-1 sm:gap-4 md:gap-8 h-full">
          {["EUR/USD", "GBP/USD", "EUR/SGD"].map((pair) => (
            <button
              key={pair}
              data-testid={`tab-${pair.replace("/", "")}`}
              onClick={() => setActivePair(pair)}
              className="relative h-full px-2 sm:px-3 font-medium transition-colors"
              style={{
                fontSize: "clamp(0.7rem, 2.5vw, 0.875rem)",
                color: activePair === pair ? "#ffffff" : "#9fa6b2",
              }}
            >
              {pair}
              {activePair === pair && (
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-t-full"
                  style={{ height: "2px", background: "#00b97a", boxShadow: "0 -2px 8px rgba(0,185,122,0.5)" }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Account Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg transition-colors outline-none shrink-0"
            style={{ background: "rgba(255,255,255,0.04)" }}
            data-testid="account-dropdown"
          >
            <div className="flex flex-col items-end">
              <span className="hidden sm:block text-[10px]" style={{ color: "#9fa6b2" }}>
                Practice Account
              </span>
              <span className="font-semibold" style={{ color: "#f59e0b", fontSize: "clamp(0.7rem, 2.5vw, 0.875rem)" }}>
                $9,384.57
              </span>
            </div>
            <ChevronDown className="w-3 h-3" style={{ color: "#9fa6b2" }} />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[210px] border"
            style={{ background: "#1c2438", borderColor: "rgba(255,255,255,0.1)" }}
          >
            <DropdownMenuItem className="flex justify-between items-center cursor-pointer focus:bg-white/5">
              <span className="text-sm text-white">Practice Account</span>
              <span className="text-sm font-semibold" style={{ color: "#f59e0b" }}>$9,384.57</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex justify-between items-center cursor-pointer focus:bg-white/5">
              <span className="text-sm text-white">Real Account</span>
              <span className="text-sm font-semibold text-white">₦21,315.67</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* ── Body: sidebar + content ─────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Left Sidebar — hidden on mobile, visible md+ */}
        <aside
          className="hidden md:flex flex-col items-center py-6 gap-5 border-r shrink-0"
          style={{ width: "70px", background: "#171d2c", borderColor: "rgba(255,255,255,0.08)" }}
        >
          {navItems.slice(0, 3).map((item) => (
            <button
              key={item.id}
              data-testid={item.id}
              title={item.label}
              className="p-3 rounded-xl transition-colors"
              style={
                item.active
                  ? { background: "rgba(0,185,122,0.12)", color: "#00b97a" }
                  : { color: "#9fa6b2" }
              }
            >
              {item.icon}
            </button>
          ))}
          <div className="mt-auto">
            <button
              data-testid="nav-settings"
              title="Settings"
              className="p-3 rounded-xl transition-colors"
              style={{ color: "#9fa6b2" }}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </aside>

        {/* ── Main Scrollable Area ──────────────────────────────────────── */}
        <div className="flex-1 flex flex-col lg:flex-row min-w-0 overflow-y-auto lg:overflow-hidden">

          {/* Center Chart Column */}
          <main className="flex-1 flex flex-col min-w-0 p-4 md:p-6 gap-4">

            {/* Price Header */}
            <div className="shrink-0">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-44 bg-white/5" />
                  <Skeleton className="h-5 w-64 bg-white/5" />
                </div>
              ) : error ? (
                <div className="text-sm" style={{ color: "#ff4a4a" }}>
                  Failed to load market data: {error}
                </div>
              ) : activeData ? (
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h2
                      className="font-bold text-white tracking-tight leading-none"
                      style={{ fontSize: "clamp(1.4rem, 5vw, 2.25rem)", marginBottom: "0.35rem" }}
                    >
                      {activeData.pair}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span
                        className="font-medium tabular-nums text-white"
                        style={{ fontSize: "clamp(1.1rem, 4vw, 1.875rem)" }}
                        data-testid="price-display"
                      >
                        {activeData.price.toFixed(5)}
                      </span>
                      <span
                        className="font-medium flex items-center gap-1"
                        style={{
                          fontSize: "clamp(0.85rem, 3vw, 1.125rem)",
                          color: activeData.change24h >= 0 ? "#00b97a" : "#ff4a4a",
                        }}
                        data-testid="change-display"
                      >
                        {activeData.change24h >= 0 ? (
                          <TrendingUp className="w-4 h-4 shrink-0" />
                        ) : (
                          <TrendingDown className="w-4 h-4 shrink-0" />
                        )}
                        {Math.abs(activeData.change24h).toFixed(2)}%
                      </span>
                      <span
                        className="pl-3 border-l flex flex-col"
                        style={{ borderColor: "rgba(255,255,255,0.12)" }}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#9fa6b2" }}>
                          Spread
                        </span>
                        <span
                          className="font-semibold text-white tabular-nums"
                          style={{ fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)" }}
                          data-testid="spread-display"
                        >
                          {activeData.spreadPips.toFixed(1)}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border self-start shrink-0"
                    style={{ background: "rgba(0,185,122,0.08)", borderColor: "rgba(0,185,122,0.2)" }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: "#00b97a", animation: "pulse 2s infinite" }}
                    />
                    <span
                      className="text-xs font-bold tracking-widest uppercase"
                      style={{ color: "#00b97a" }}
                    >
                      Live
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Chart */}
            <div
              className="relative rounded-xl border overflow-hidden"
              style={{
                flex: "1 1 0",
                minHeight: "200px",
                maxHeight: "420px",
                background: "rgba(28,36,56,0.4)",
                borderColor: "rgba(255,255,255,0.07)",
              }}
            >
              <span
                className="absolute top-3 right-4 text-[10px] font-medium uppercase tracking-widest z-10"
                style={{ color: "#9fa6b2" }}
              >
                Live Technical Chart Canvas
              </span>
              {loading || !activeData ? (
                <div className="w-full h-full flex items-center justify-center" style={{ color: "#9fa6b2" }}>
                  Loading chart data...
                </div>
              ) : (
                <ChartCanvas data={activeData.closingPrices} />
              )}
            </div>

            {/* Period Filters */}
            <div className="flex gap-2 shrink-0">
              {["5s", "1m", "1D", "1W"].map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePeriod(p)}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors"
                  style={
                    activePeriod === p
                      ? { background: "rgba(255,255,255,0.1)", color: "#ffffff" }
                      : { color: "#9fa6b2" }
                  }
                  data-testid={`period-${p}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </main>

          {/* ── Right Action Terminal ─────────────────────────────────── */}
          <aside
            className="w-full lg:w-[310px] lg:max-w-[310px] flex flex-col shrink-0 border-t lg:border-t-0 lg:border-l overflow-y-auto"
            style={{ background: "#171d2c", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="p-5 flex flex-col gap-5">

              {/* Investment */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: "#9fa6b2" }}
                >
                  Investment
                </label>
                <div
                  className="flex h-14 rounded-xl overflow-hidden border"
                  style={{ background: "#111622", borderColor: "rgba(255,255,255,0.1)" }}
                >
                  <button
                    className="w-14 flex items-center justify-center text-xl font-medium border-r transition-colors hover:bg-white/5 shrink-0"
                    style={{ color: "#9fa6b2", borderColor: "rgba(255,255,255,0.08)" }}
                    onClick={() => {
                      const v = Math.max(1, parseFloat(investment) - 10);
                      setInvestment(v.toString());
                    }}
                    data-testid="btn-investment-decrease"
                  >
                    -
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center transition-colors hover:bg-white/5"
                    onClick={() => setShowNumpad(true)}
                    data-testid="btn-investment-field"
                  >
                    <span className="text-xl font-semibold tabular-nums text-white">
                      ${formatInvestment(investment)}
                    </span>
                  </button>
                  <button
                    className="w-14 flex items-center justify-center text-xl font-medium border-l transition-colors hover:bg-white/5 shrink-0"
                    style={{ color: "#9fa6b2", borderColor: "rgba(255,255,255,0.08)" }}
                    onClick={() => {
                      const v = parseFloat(investment) + 10;
                      setInvestment(v.toString());
                    }}
                    data-testid="btn-investment-increase"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Leverage */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: "#9fa6b2" }}
                >
                  Leverage
                </label>
                <div className="flex gap-1.5">
                  {["x25", "x50", "x100", "x200", "x400"].map((lev) => (
                    <button
                      key={lev}
                      onClick={() => setActiveLeverage(lev)}
                      className="flex-1 py-2 text-xs font-medium rounded-lg border transition-colors"
                      style={
                        activeLeverage === lev
                          ? {
                              background: "rgba(0,185,122,0.12)",
                              color: "#00b97a",
                              borderColor: "rgba(0,185,122,0.3)",
                            }
                          : {
                              background: "#111622",
                              color: "#9fa6b2",
                              borderColor: "rgba(255,255,255,0.08)",
                            }
                      }
                      data-testid={`leverage-${lev}`}
                    >
                      {lev}
                    </button>
                  ))}
                </div>
              </div>

              {/* P&L */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-xl p-3 border flex flex-col gap-0.5"
                  style={{ background: "#111622", borderColor: "rgba(255,255,255,0.08)" }}
                  data-testid="panel-profit"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#9fa6b2" }}>
                    Profit
                  </span>
                  <span className="text-lg font-semibold tabular-nums" style={{ color: "#00b97a" }}>
                    +$4.80
                  </span>
                </div>
                <div
                  className="rounded-xl p-3 border flex flex-col gap-0.5"
                  style={{ background: "#111622", borderColor: "rgba(255,255,255,0.08)" }}
                  data-testid="panel-loss"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#9fa6b2" }}>
                    Loss
                  </span>
                  <span className="text-lg font-semibold tabular-nums" style={{ color: "#ff4a4a" }}>
                    -$2.90
                  </span>
                </div>
              </div>

              {/* BUY / SELL */}
              <div className="flex flex-col gap-3">
                <button
                  className="w-full rounded-xl font-bold flex items-center justify-between px-5 transition-all active:scale-[0.98]"
                  style={{
                    height: "62px",
                    background: "#00b97a",
                    boxShadow: "0 0 20px rgba(0,185,122,0.25)",
                    fontSize: "clamp(1rem, 3vw, 1.125rem)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#00d48c";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 28px rgba(0,185,122,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#00b97a";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(0,185,122,0.25)";
                  }}
                  data-testid="btn-buy"
                >
                  <div className="flex flex-col items-start leading-tight">
                    <span className="font-bold tracking-wider">BUY</span>
                    <span
                      className="font-medium tabular-nums"
                      style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.75)" }}
                    >
                      ▲ {activeData ? (activeData.price + 0.00010).toFixed(5) : "---"}
                    </span>
                  </div>
                  <TrendingUp className="w-6 h-6 opacity-85 shrink-0" />
                </button>

                <button
                  className="w-full rounded-xl font-bold flex items-center justify-between px-5 transition-all active:scale-[0.98]"
                  style={{
                    height: "62px",
                    background: "#ff4a4a",
                    boxShadow: "0 0 20px rgba(255,74,74,0.2)",
                    fontSize: "clamp(1rem, 3vw, 1.125rem)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#ff6464";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 28px rgba(255,74,74,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#ff4a4a";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(255,74,74,0.2)";
                  }}
                  data-testid="btn-sell"
                >
                  <div className="flex flex-col items-start leading-tight">
                    <span className="font-bold tracking-wider">SELL</span>
                    <span
                      className="font-medium tabular-nums"
                      style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.75)" }}
                    >
                      ▼ {activeData ? (activeData.price - 0.00010).toFixed(5) : "---"}
                    </span>
                  </div>
                  <TrendingDown className="w-6 h-6 opacity-85 shrink-0" />
                </button>
              </div>

              {/* Divider */}
              <hr style={{ borderColor: "rgba(255,255,255,0.08)" }} />

              {/* AI Market Insight */}
              <div className="flex flex-col gap-3 pb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="p-1.5 rounded-lg"
                    style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold tracking-wide text-white">AI Market Insight</h3>
                </div>

                <textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="e.g. RSI at 74, price near resistance..."
                  rows={3}
                  className="w-full rounded-lg p-3 text-sm resize-none outline-none transition-all"
                  style={{
                    background: "#111622",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#ffffff",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                  data-testid="input-ai-condition"
                />

                <button
                  onClick={handleAiAnalyze}
                  disabled={aiLoading || !aiInput.trim()}
                  className="w-full h-10 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: aiLoading ? "#4f46e5" : "#4f46e5" }}
                  onMouseEnter={(e) => {
                    if (!aiLoading && aiInput.trim())
                      (e.currentTarget as HTMLButtonElement).style.background = "#6366f1";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#4f46e5";
                  }}
                  data-testid="btn-analyze"
                >
                  {aiLoading ? "Analyzing..." : "Analyze"}
                </button>

                {aiResponse && (
                  <div
                    className="p-3 rounded-lg text-sm leading-relaxed"
                    style={{
                      background: "#111622",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#9fa6b2",
                    }}
                    data-testid="ai-response"
                  >
                    {aiResponse}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Mobile Bottom Nav ─────────────────────────────────────────── */}
      <nav
        className="md:hidden flex items-center justify-around border-t shrink-0"
        style={{
          background: "#171d2c",
          borderColor: "rgba(255,255,255,0.08)",
          height: "56px",
        }}
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            data-testid={`mobile-${item.id}`}
            className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors"
            style={item.active ? { color: "#00b97a" } : { color: "#9fa6b2" }}
          >
            {item.icon}
            <span className="text-[9px] font-semibold uppercase tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
