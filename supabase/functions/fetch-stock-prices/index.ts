import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbols } = await req.json();
    const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');

    if (!apiKey) {
      throw new Error('ALPHA_VANTAGE_API_KEY not configured');
    }

    console.log('Fetching prices for symbols:', symbols);

    // Demo data for BSE stocks with realistic Indian stock prices
    const demoStockData: Record<string, { base: number; volatility: number }> = {
      'RELIANCE.BSE': { base: 2450, volatility: 50 },
      'TCS.BSE': { base: 3650, volatility: 80 },
      'HDFCBANK.BSE': { base: 1680, volatility: 40 },
      'INFY.BSE': { base: 1520, volatility: 35 },
      'HINDUNILVR.BSE': { base: 2380, volatility: 45 },
      'ICICIBANK.BSE': { base: 1150, volatility: 30 },
      'BHARTIARTL.BSE': { base: 1620, volatility: 35 },
      'ITC.BSE': { base: 465, volatility: 12 },
      'SBIN.BSE': { base: 820, volatility: 20 },
      'LT.BSE': { base: 3580, volatility: 75 }
    };

    const prices = symbols.map((symbol: string) => {
      const stockData = demoStockData[symbol];
      if (!stockData) {
        return { symbol, error: true };
      }

      // Generate realistic price variations
      const randomChange = (Math.random() - 0.5) * stockData.volatility;
      const currentPrice = stockData.base + randomChange;
      const yesterdayPrice = stockData.base + (Math.random() - 0.5) * stockData.volatility * 0.8;
      const previousClose = yesterdayPrice;
      
      // Calculate today's change
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;
      
      // Simple prediction using trend
      const last5Prices = Array.from({ length: 5 }, (_, i) => 
        stockData.base + (Math.random() - 0.5) * stockData.volatility * (1 - i * 0.1)
      );
      const avgPrice = last5Prices.reduce((a, b) => a + b, 0) / last5Prices.length;
      const trend = (currentPrice - avgPrice) / avgPrice;
      const tomorrowPredicted = currentPrice * (1 + trend * 0.7);
      
      return {
        symbol,
        currentPrice: Math.round(currentPrice * 100) / 100,
        previousClose: Math.round(previousClose * 100) / 100,
        yesterdayPrice: Math.round(yesterdayPrice * 100) / 100,
        tomorrowPredicted: Math.round(tomorrowPredicted * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        high: Math.round((currentPrice + Math.abs(randomChange) * 0.5) * 100) / 100,
        low: Math.round((currentPrice - Math.abs(randomChange) * 0.5) * 100) / 100,
        open: Math.round(previousClose * 100) / 100,
        timestamp: Date.now() / 1000,
      };
    });
    console.log('Fetched prices:', prices);

    return new Response(
      JSON.stringify({ prices }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in fetch-stock-prices function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
