import { Stock } from '@/types/trading';

// Initial stock data - Using NSE/BSE stock symbols for Alpha Vantage API
export const INITIAL_STOCKS: Omit<Stock, 'change' | 'changePercent' | 'previousPrice'>[] = [
  { symbol: 'RELIANCE.BSE', name: 'Reliance Industries', currentPrice: 0, volume: 0 },
  { symbol: 'TCS.BSE', name: 'Tata Consultancy Services', currentPrice: 0, volume: 0 },
  { symbol: 'HDFCBANK.BSE', name: 'HDFC Bank', currentPrice: 0, volume: 0 },
  { symbol: 'INFY.BSE', name: 'Infosys', currentPrice: 0, volume: 0 },
  { symbol: 'HINDUNILVR.BSE', name: 'Hindustan Unilever', currentPrice: 0, volume: 0 },
  { symbol: 'ICICIBANK.BSE', name: 'ICICI Bank', currentPrice: 0, volume: 0 },
  { symbol: 'BHARTIARTL.BSE', name: 'Bharti Airtel', currentPrice: 0, volume: 0 },
  { symbol: 'ITC.BSE', name: 'ITC Limited', currentPrice: 0, volume: 0 },
  { symbol: 'SBIN.BSE', name: 'State Bank of India', currentPrice: 0, volume: 0 },
  { symbol: 'LT.BSE', name: 'Larsen & Toubro', currentPrice: 0, volume: 0 },
];

export const INITIAL_BALANCE = 100000;

// Simulate price changes
export const simulatePriceChange = (currentPrice: number): number => {
  const changePercent = (Math.random() - 0.5) * 3; // -1.5% to +1.5%
  const change = (currentPrice * changePercent) / 100;
  return Math.max(currentPrice + change, 1); // Ensure price doesn't go negative
};
