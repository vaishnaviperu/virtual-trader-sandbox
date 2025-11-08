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
  { symbol: 'KOTAKBANK.BSE', name: 'Kotak Mahindra Bank', currentPrice: 0, volume: 0 },
  { symbol: 'AXISBANK.BSE', name: 'Axis Bank', currentPrice: 0, volume: 0 },
  { symbol: 'BAJFINANCE.BSE', name: 'Bajaj Finance', currentPrice: 0, volume: 0 },
  { symbol: 'MARUTI.BSE', name: 'Maruti Suzuki', currentPrice: 0, volume: 0 },
  { symbol: 'HCLTECH.BSE', name: 'HCL Technologies', currentPrice: 0, volume: 0 },
  { symbol: 'WIPRO.BSE', name: 'Wipro', currentPrice: 0, volume: 0 },
  { symbol: 'ASIANPAINT.BSE', name: 'Asian Paints', currentPrice: 0, volume: 0 },
  { symbol: 'TITAN.BSE', name: 'Titan Company', currentPrice: 0, volume: 0 },
  { symbol: 'SUNPHARMA.BSE', name: 'Sun Pharmaceutical', currentPrice: 0, volume: 0 },
  { symbol: 'ULTRACEMCO.BSE', name: 'UltraTech Cement', currentPrice: 0, volume: 0 },
  { symbol: 'NESTLEIND.BSE', name: 'Nestle India', currentPrice: 0, volume: 0 },
  { symbol: 'POWERGRID.BSE', name: 'Power Grid Corporation', currentPrice: 0, volume: 0 },
];

export const INITIAL_BALANCE = 100000;

// Simulate price changes
export const simulatePriceChange = (currentPrice: number): number => {
  const changePercent = (Math.random() - 0.5) * 3; // -1.5% to +1.5%
  const change = (currentPrice * changePercent) / 100;
  return Math.max(currentPrice + change, 1); // Ensure price doesn't go negative
};
