import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  BarChart2, 
  Activity, 
  Calendar, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  Sparkles,
  ChevronDown
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface MarketData {
  pair: string;
  price: number;
  change24h: number;
  spreadPips: number;
  closingPrices: number[];
}

export default function Dashboard() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activePair, setActivePair] = useState("EUR/USD");
  const [activePeriod, setActivePeriod] = useState("1D");
  const [activeLeverage, setActiveLeverage] = useState("x100");
  
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
      } catch (err: any) {
        setError(err.message || "An error occurred");
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
        body: JSON.stringify({ currencyPair: activePair, technicalCondition: aiInput })
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setAiResponse(data.analysis || "No response");
    } catch (err: any) {
      setAiResponse(`Error: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const activeData = marketData.find(d => d.pair === activePair) || marketData[0];

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-background text-foreground font-sans selection:bg-primary/30">
      
      {/* Top Navbar */}
      <header className="h-[60px] flex items-center justify-between px-6 border-b border-border bg-card z-10 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-white">Goodness Trade Lens</h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            EDU BETA
          </span>
        </div>

        <nav className="flex items-center gap-8 h-full">
          {["EUR/USD", "GBP/USD", "EUR/SGD"].map(pair => (
            <button
              key={pair}
              data-testid={`tab-${pair.replace('/', '')}`}
              onClick={() => setActivePair(pair)}
              className={`relative h-full px-2 text-sm font-medium transition-colors ${
                activePair === pair ? "text-white" : "text-muted-foreground hover:text-white/80"
              }`}
            >
              {pair}
              {activePair === pair && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(0,185,122,0.5)]" />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <div className="text-right flex flex-col">
                <span className="text-xs text-muted-foreground">Practice Account</span>
                <span className="text-sm font-semibold text-amber-500">$9,384.57</span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] border-border bg-card">
              <DropdownMenuItem className="flex justify-between items-center cursor-pointer focus:bg-white/5">
                <span className="text-sm">Practice Account</span>
                <span className="text-sm text-amber-500">$9,384.57</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex justify-between items-center cursor-pointer focus:bg-white/5">
                <span className="text-sm">Real Account</span>
                <span className="text-sm text-white">₦21,315.67</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Sidebar */}
        <aside className="w-[70px] flex flex-col items-center py-6 gap-6 border-r border-border bg-card shrink-0 z-10">
          <button data-testid="nav-assets" className="p-3 rounded-xl bg-primary/10 text-primary shadow-[inset_2px_0_0_0_var(--color-primary)]">
            <BarChart2 className="w-5 h-5" />
          </button>
          <button data-testid="nav-indicators" className="p-3 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
            <Activity className="w-5 h-5" />
          </button>
          <button data-testid="nav-calendar" className="p-3 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
            <Calendar className="w-5 h-5" />
          </button>
          <div className="mt-auto">
            <button data-testid="nav-settings" className="p-3 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 flex flex-col min-w-0 bg-background relative z-0">
          
          {/* Top Info Area */}
          <div className="px-8 pt-8 pb-4 shrink-0">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-[200px] bg-white/5" />
                <Skeleton className="h-6 w-[300px] bg-white/5" />
              </div>
            ) : error ? (
              <div className="text-destructive">Failed to load market data: {error}</div>
            ) : activeData ? (
              <div className="flex justify-between items-end">
                <div className="flex gap-6 items-baseline">
                  <div>
                    <h2 className="text-4xl font-bold text-white tracking-tight leading-none mb-2">{activeData.pair}</h2>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-medium tabular-nums text-white" data-testid="price-display">
                        {activeData.price.toFixed(5)}
                      </span>
                      <span 
                        className={`text-lg font-medium flex items-center gap-1 ${
                          activeData.change24h >= 0 ? "text-primary" : "text-destructive"
                        }`}
                      >
                        {activeData.change24h >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        {Math.abs(activeData.change24h).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 px-4 border-l border-border/50">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Spread</span>
                    <span className="text-sm font-semibold text-white">{activeData.spreadPips.toFixed(1)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-bold text-primary tracking-widest uppercase">Live</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Chart Area */}
          <div className="flex-1 flex flex-col px-8 pb-8 min-h-0 relative">
            <div className="absolute top-0 right-8 text-xs text-muted-foreground uppercase tracking-widest font-medium z-10">
              Live Technical Chart Canvas
            </div>
            
            <div className="flex-1 w-full bg-card/30 rounded-xl border border-border/50 mt-4 overflow-hidden relative group p-6">
              {loading || !activeData ? (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Loading chart data...
                </div>
              ) : (
                <ChartCanvas data={activeData.closingPrices} />
              )}
            </div>
            
            {/* Period Filters */}
            <div className="flex gap-2 mt-4">
              {["5s", "1m", "1D", "1W"].map(period => (
                <button
                  key={period}
                  onClick={() => setActivePeriod(period)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    activePeriod === period 
                      ? "bg-white/10 text-white" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-white/80"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </main>

        {/* Right Terminal */}
        <aside className="w-[320px] bg-card border-l border-border flex flex-col shrink-0 overflow-y-auto">
          
          <div className="p-5 flex flex-col gap-6">
            
            {/* Investment Card */}
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Investment</label>
              <div className="flex h-14 bg-background border border-border rounded-xl overflow-hidden shadow-inner">
                <button className="w-14 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/5 transition-colors border-r border-border shrink-0">
                  <span className="text-xl leading-none block mb-[2px]">-</span>
                </button>
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-xl font-medium tabular-nums text-white">$100.00</span>
                </div>
                <button className="w-14 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/5 transition-colors border-l border-border shrink-0">
                  <span className="text-xl leading-none block mb-[2px]">+</span>
                </button>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Leverage</label>
                <div className="flex gap-1.5 justify-between">
                  {["x25", "x50", "x100", "x200", "x400"].map(lev => (
                    <button
                      key={lev}
                      onClick={() => setActiveLeverage(lev)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
                        activeLeverage === lev
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "bg-background border border-border text-muted-foreground hover:bg-white/5"
                      }`}
                    >
                      {lev}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* P&L */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background rounded-xl p-3 border border-border flex flex-col">
                <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase mb-1">Profit</span>
                <span className="text-lg font-semibold text-primary tabular-nums">+$4.80</span>
              </div>
              <div className="bg-background rounded-xl p-3 border border-border flex flex-col">
                <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase mb-1">Loss</span>
                <span className="text-lg font-semibold text-destructive tabular-nums">-$2.90</span>
              </div>
            </div>

            {/* Buy / Sell Buttons */}
            <div className="flex flex-col gap-3 mt-2">
              <Button 
                className="w-full h-[60px] bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold shadow-[0_0_15px_rgba(0,185,122,0.2)] flex justify-between px-6"
                data-testid="btn-buy"
              >
                <div className="flex flex-col items-start leading-tight">
                  <span>BUY</span>
                  <span className="text-[11px] font-medium text-primary-foreground/80 tabular-nums">
                    ▲ {activeData ? (activeData.price + 0.0001).toFixed(5) : "---"}
                  </span>
                </div>
                <TrendingUp className="w-6 h-6 opacity-80" />
              </Button>

              <Button 
                className="w-full h-[60px] bg-destructive hover:bg-destructive/90 text-destructive-foreground text-lg font-bold shadow-[0_0_15px_rgba(255,74,74,0.2)] flex justify-between px-6"
                data-testid="btn-sell"
              >
                <div className="flex flex-col items-start leading-tight">
                  <span>SELL</span>
                  <span className="text-[11px] font-medium text-destructive-foreground/80 tabular-nums">
                    ▼ {activeData ? (activeData.price - 0.0001).toFixed(5) : "---"}
                  </span>
                </div>
                <TrendingDown className="w-6 h-6 opacity-80" />
              </Button>
            </div>
            
            <hr className="border-border mt-2" />

            {/* AI Analysis Panel */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-white">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold tracking-wide">AI Market Insight</h3>
              </div>
              
              <div className="flex flex-col gap-2">
                <textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="e.g. RSI at 74, price near resistance..."
                  className="w-full h-20 bg-background border border-border rounded-lg p-3 text-sm text-white placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  data-testid="input-ai-condition"
                />
                <Button 
                  onClick={handleAiAnalyze}
                  disabled={aiLoading || !aiInput.trim()}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                  data-testid="btn-analyze"
                >
                  {aiLoading ? "Analyzing..." : "Analyze"}
                </Button>
              </div>

              {aiResponse && (
                <div className="mt-2 p-3 rounded-lg bg-background border border-border text-sm leading-relaxed text-muted-foreground">
                  {aiResponse}
                </div>
              )}
            </div>

          </div>
        </aside>
      </div>
    </div>
  );
}

// Chart Canvas Component (SVG)
function ChartCanvas({ data }: { data: number[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = range * 0.1;
  const yMin = min - padding;
  const yMax = max + padding;
  const yRange = yMax - yMin;

  const width = 1000;
  const height = 400;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - yMin) / yRange) * height;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="w-full h-full" ref={containerRef}>
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Grid lines (decorative) */}
        {[0, 1, 2, 3, 4].map(i => (
          <line 
            key={i}
            x1="0" y1={(height / 4) * i} 
            x2={width} y2={(height / 4) * i} 
            stroke="hsl(var(--border))" 
            strokeOpacity="0.3"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* Area fill */}
        <path d={areaD} fill="url(#chartGradient)" />

        {/* Line */}
        <path 
          d={pathD} 
          fill="none" 
          stroke="hsl(var(--primary))" 
          strokeWidth="3" 
          vectorEffect="non-scaling-stroke"
          filter="url(#glow)"
        />

        {/* Current price point indicator */}
        {points.length > 0 && (
          <circle 
            cx={width} 
            cy={points[points.length - 1].split(',')[1]} 
            r="4" 
            fill="hsl(var(--primary))"
            className="animate-pulse"
          />
        )}
      </svg>
    </div>
  );
}
