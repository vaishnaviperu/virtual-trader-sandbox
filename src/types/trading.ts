export interface Stock {
  symbol: string;
  name: string;
  currentPrice: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  yesterdayPrice?: number;
  tomorrowPredicted?: number;
}

export interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  invested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export interface Transaction {
  id: string;
  type: 'BUY' | 'SELL';
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  timestamp: Date;
}

export interface Portfolio {
  balance: number;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  holdings: Holding[];
  transactions: Transaction[];
}
