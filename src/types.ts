export interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  holdings?: number;
  value?: number;
  trend: 'up' | 'down';
}

export interface Activity {
  id: string;
  type: 'buy' | 'sell' | 'deposit';
  symbol?: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending';
}
