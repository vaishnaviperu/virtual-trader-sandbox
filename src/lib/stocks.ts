import { Stock } from '@/types/trading';

// Initial stock data
export const INITIAL_STOCKS: Omit<Stock, 'change' | 'changePercent' | 'previousPrice'>[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', currentPrice: 2456.75, volume: 1245000 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', currentPrice: 3678.50, volume: 892000 },
  { symbol: 'HDFC', name: 'HDFC Bank Ltd.', currentPrice: 1689.25, volume: 2340000 },
  { symbol: 'INFY', name: 'Infosys Ltd.', currentPrice: 1534.80, volume: 1567000 },
  { symbol: 'ICICI', name: 'ICICI Bank Ltd.', currentPrice: 967.45, volume: 1890000 },
  { symbol: 'BHARTI', name: 'Bharti Airtel Ltd.', currentPrice: 892.30, volume: 945000 },
  { symbol: 'ITC', name: 'ITC Ltd.', currentPrice: 456.90, volume: 3120000 },
  { symbol: 'WIPRO', name: 'Wipro Ltd.', currentPrice: 445.60, volume: 1234000 },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', currentPrice: 1089.75, volume: 1456000 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.', currentPrice: 9876.50, volume: 234000 },
];

export const INITIAL_BALANCE = 100000;

// Simulate price changes
export const simulatePriceChange = (currentPrice: number): number => {
  const changePercent = (Math.random() - 0.5) * 3; // -1.5% to +1.5%
  const change = (currentPrice * changePercent) / 100;
  return Math.max(currentPrice + change, 1); // Ensure price doesn't go negative
};
