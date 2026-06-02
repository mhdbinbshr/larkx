import { createChart, ColorType, Time, CandlestickData, CandlestickSeries } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

interface LiveTradingChartProps {
  data: CandlestickData<Time>[];
}

export function LiveTradingChart({ data }: LiveTradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#666666',
        fontFamily: '"JetBrains Mono", monospace',
      },
      grid: {
        vertLines: { color: '#111111', style: 1 },
        horzLines: { color: '#111111', style: 1 },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#1a1a1a',
        barSpacing: 28, // High spacing for distinct large candles
        rightOffset: 12,
        fixLeftEdge: true,
      },
      rightPriceScale: {
        borderColor: '#1a1a1a',
        autoScale: true,
        entireTextOnly: true,
      },
      crosshair: {
        mode: 1, // Magnet
        vertLine: {
          color: '#333333',
          labelBackgroundColor: '#000000',
          style: 3,
        },
        horzLine: {
          color: '#333333',
          labelBackgroundColor: '#000000',
          style: 3,
        },
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });

    seriesRef.current = candlestickSeries;

    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0 || entries[0].target !== chartContainerRef.current) {
        return;
      }
      const newRect = entries[0].contentRect;
      chart.applyOptions({ width: newRect.width, height: newRect.height });
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      seriesRef.current.setData(data);
    }
  }, [data]);

  return <div ref={chartContainerRef} className="absolute inset-0 w-full h-full z-10" />;
}
