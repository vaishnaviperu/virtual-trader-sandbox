import { Stock } from '@/types/trading';

// Initial stock data - Using US stock symbols for Finnhub API
export const INITIAL_STOCKS: Omit<Stock, 'change' | 'changePercent' | 'previousPrice'>[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', currentPrice: 0, volume: 0 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', currentPrice: 0, volume: 0 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', currentPrice: 0, volume: 0 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', currentPrice: 0, volume: 0 },
  { symbol: 'TSLA', name: 'Tesla Inc.', currentPrice: 0, volume: 0 },
  { symbol: 'META', name: 'Meta Platforms Inc.', currentPrice: 0, volume: 0 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', currentPrice: 0, volume: 0 },
  { symbol: 'NFLX', name: 'Netflix Inc.', currentPrice: 0, volume: 0 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', currentPrice: 0, volume: 0 },
  { symbol: 'INTC', name: 'Intel Corporation', currentPrice: 0, volume: 0 },
];

export const INITIAL_BALANCE = 100000;

// Simulate price changes
export const simulatePriceChange = (currentPrice: number): number => {
  const changePercent = (Math.random() - 0.5) * 3; // -1.5% to +1.5%
  const change = (currentPrice * changePercent) / 100;
  return Math.max(currentPrice + change, 1); // Ensure price doesn't go negative
};
