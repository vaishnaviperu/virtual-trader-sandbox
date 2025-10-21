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

    // Fetch prices for all symbols in parallel
    const pricePromises = symbols.map(async (symbol: string) => {
      try {
        // Fetch daily time series for historical data
        const timeSeriesResponse = await fetch(
          `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`
        );
        
        if (!timeSeriesResponse.ok) {
          console.error(`Error fetching time series for ${symbol}:`, timeSeriesResponse.statusText);
          return { symbol, error: true };
        }

        const timeSeriesData = await timeSeriesResponse.json();
        const timeSeries = timeSeriesData['Time Series (Daily)'];
        
        if (!timeSeries || Object.keys(timeSeries).length === 0) {
          console.error(`No time series data for ${symbol}`);
          return { symbol, error: true };
        }

        // Get the dates in order
        const dates = Object.keys(timeSeries).sort().reverse();
        const today = dates[0];
        const yesterday = dates[1];
        
        const todayData = timeSeries[today];
        const yesterdayData = timeSeries[yesterday];
        
        const currentPrice = parseFloat(todayData['4. close']);
        const previousClose = parseFloat(yesterdayData['4. close']);
        const yesterdayPrice = previousClose;
        const change = currentPrice - previousClose;
        const changePercent = (change / previousClose) * 100;
        
        // Simple prediction: use moving average trend
        const last5Days = dates.slice(0, 5).map(date => parseFloat(timeSeries[date]['4. close']));
        const avgPrice = last5Days.reduce((a, b) => a + b, 0) / last5Days.length;
        const trend = (currentPrice - avgPrice) / avgPrice;
        const tomorrowPredicted = currentPrice * (1 + trend);
        
        return {
          symbol,
          currentPrice,
          previousClose,
          change,
          changePercent,
          yesterdayPrice,
          tomorrowPredicted,
          high: parseFloat(todayData['2. high']),
          low: parseFloat(todayData['3. low']),
          open: parseFloat(todayData['1. open']),
          timestamp: Date.now() / 1000,
        };
      } catch (error) {
        console.error(`Error processing ${symbol}:`, error);
        return { symbol, error: true };
      }
    });

    const prices = await Promise.all(pricePromises);
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
