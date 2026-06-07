import { useState, useEffect } from 'react';
import { formatCurrency } from '../lib/utils';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { LiveTradingChart } from './LiveTradingChart';
import { CandlestickData, Time } from 'lightweight-charts';

const INVESTED_AMOUNT = 200000;
const FINAL_TARGET = 318364;

// June 7, 2026 to June 16, 2026 progression
const START_TIME = new Date('2026-06-07T00:00:00Z').getTime();
const END_TIME = new Date('2026-06-16T00:00:00Z').getTime();

const getExpectedCurrentValue = () => {
  const now = Date.now();
  if (now <= START_TIME) return INVESTED_AMOUNT;
  if (now >= END_TIME) return FINAL_TARGET;
  const progress = (now - START_TIME) / (END_TIME - START_TIME);
  return INVESTED_AMOUNT + (FINAL_TARGET - INVESTED_AMOUNT) * progress;
};

// Start near expected value
const INITIAL_CURRENT = getExpectedCurrentValue() + (Math.random() * 2000 - 1000);

export function MainDashboard() {
  const [data, setData] = useState<CandlestickData<Time>[]>([]);
  const [currentValue, setCurrentValue] = useState(INITIAL_CURRENT);
  const [profit, setProfit] = useState(INITIAL_CURRENT - INVESTED_AMOUNT);

  useEffect(() => {
    // 1. Generate historical OHLC data (120 bars of 1 minute)
    const expectedInitial = getExpectedCurrentValue();
    const currentRealMinute = Math.floor(Date.now() / 1000 / 60) * 60;
    
    // Generate backwards so it ends up exactly near expectedInitial
    const historyRev: CandlestickData<Time>[] = [];
    let nextClose = expectedInitial;

    for (let i = 0; i <= 120; i++) {
        const time = (currentRealMinute - i * 60) as Time;
        const volatility = 400 + Math.random() * 1500; // Ultra high volatility
        
        const open = nextClose - (Math.random() - 0.5) * volatility;
        const high = Math.max(open, nextClose) + Math.random() * 800;
        const low = Math.min(open, nextClose) - Math.random() * 800;

        historyRev.push({
            time,
            open,
            high,
            low,
            close: nextClose
        });
        
        nextClose = open;
    }
    
    const history = historyRev.reverse();
    setData(history);
    
    // 2. Start live simulation tick
    const interval = setInterval(() => {
      setData((prev) => {
        if (prev.length === 0) return prev;
        const lastCandle = prev[prev.length - 1];
        
        // Use the current real minute to determine if we need a new candle
        const nowMinute = Math.floor(Date.now() / 1000 / 60) * 60;
        
        // Calculate realistic high volatility leaning towards expected target over time
        const expectedNow = getExpectedCurrentValue();
        const distanceToExpected = expectedNow - lastCandle.close;
        const trend = distanceToExpected / 30; // Smooth pull towards target over ~30 ticks roughly
        
        const volatility = 400 + Math.random() * 1500; // High volatile price fluctuations
        const change = trend + (Math.random() - 0.5) * volatility;
        
        const newCandles = [...prev];
        
        if (lastCandle.time === nowMinute) {
           // Update current minute candle
           const newClose = lastCandle.close + change;
           newCandles[newCandles.length - 1] = {
             ...lastCandle,
             close: newClose,
             high: Math.max(lastCandle.high, newClose),
             low: Math.min(lastCandle.low, newClose)
           };
        } else if (nowMinute > lastCandle.time) {
           // New minute candle!
           const newClose = lastCandle.close + change;
           newCandles.push({
             time: nowMinute as Time,
             open: lastCandle.close,
             high: Math.max(lastCandle.close, newClose),
             low: Math.min(lastCandle.close, newClose),
             close: newClose
           });
        }
        
        const latestClose = newCandles[newCandles.length - 1].close;
        setCurrentValue(latestClose);
        setProfit(latestClose - INVESTED_AMOUNT);

        return newCandles;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const isProfit = profit >= 0;
  const percentage = (Math.abs(profit) / INVESTED_AMOUNT) * 100;

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-background overflow-hidden relative">
      
      {/* Top Header / Stats Bar */}
      <header className="flex-none p-6 md:p-8 border-b border-border bg-surface z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-2xl">
        <div className="flex items-center gap-5">
           <div className="w-14 h-14 rounded-2xl bg-surface-hover border border-border flex items-center justify-center shadow-inner">
              <Activity className="w-6 h-6 text-primary" />
           </div>
           <div>
              <h1 className="text-sm font-mono tracking-widest text-muted uppercase">LarkX Terminal</h1>
              <div className="flex items-center gap-2 mt-1.5">
                 <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-up opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-up"></span>
                 </span>
                 <p className="text-xs font-mono text-up tracking-widest uppercase">System Online</p>
              </div>
           </div>
        </div>

        <div className="flex flex-wrap md:flex-nowrap items-center gap-8 xl:gap-16">
           <div>
             <p className="text-[10px] sm:text-xs font-mono text-muted uppercase tracking-widest mb-1.5">Invested (07/06/26)</p>
             <p className="text-xl xl:text-2xl font-mono text-primary">{formatCurrency(INVESTED_AMOUNT)}</p>
           </div>
           
           <div>
             <p className="text-[10px] sm:text-xs font-mono text-muted uppercase tracking-widest mb-1.5">Current Balance</p>
             <p className="text-2xl xl:text-4xl font-mono tracking-tighter transition-colors font-medium" style={{ color: isProfit ? 'var(--color-up)' : 'var(--color-down)' }}>
               {formatCurrency(currentValue)}
             </p>
           </div>
           
           <div className="text-left md:text-right">
             <p className="text-[10px] sm:text-xs font-mono text-muted uppercase tracking-widest mb-1.5">Session P/L</p>
             <div className="flex items-center md:justify-end gap-3">
                 <p className={`text-2xl xl:text-3xl font-mono tracking-tighter font-medium ${isProfit ? 'text-up' : 'text-down'}`}>
                   {isProfit ? '+' : '-'}{formatCurrency(Math.abs(profit))}
                 </p>
                 <span className={`text-xs md:text-sm font-mono flex items-center bg-surface-hover px-2 py-1.5 rounded-md border border-border ${isProfit ? 'text-up' : 'text-down'}`}>
                    {isProfit ? '+' : '-'}{percentage.toFixed(2)}%
                    {isProfit ? <ArrowUpRight className="w-3.5 h-3.5 ml-1" /> : <ArrowDownRight className="w-3.5 h-3.5 ml-1" />}
                 </span>
             </div>
           </div>
        </div>
      </header>

      {/* Main Chart Area */}
      <main className="flex-1 w-full relative bg-background">
         {data.length > 0 && <LiveTradingChart data={data} />}
         
         <div className="absolute bottom-8 left-8 pointer-events-none z-0">
            <h2 className="text-6xl md:text-[120px] leading-none font-mono tracking-tighter opacity-5 uppercase font-bold select-none text-muted">
               LARK-X
            </h2>
            <p className="text-sm md:text-xl font-mono tracking-widest opacity-10 uppercase ml-2 mt-4 text-muted">
               Realistic Target Protocol Active
            </p>
         </div>
      </main>
    </div>
  );
}
