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

    // Map BSE symbols to Alpha Vantage compatible symbols (NSE equivalents)
    const symbolMap: Record<string, string> = {
      'RELIANCE.BSE': 'RELIANCE.BSE',
      'TCS.BSE': 'TCS.BSE',
      'HDFCBANK.BSE': 'HDFCBANK.BSE',
      'INFY.BSE': 'INFY.BSE',
      'HINDUNILVR.BSE': 'HINDUNILVR.BSE',
      'ICICIBANK.BSE': 'ICICIBANK.BSE',
      'BHARTIARTL.BSE': 'BHARTIARTL.BSE',
      'ITC.BSE': 'ITC.BSE',
      'SBIN.BSE': 'SBIN.BSE',
      'LT.BSE': 'LT.BSE',
      'KOTAKBANK.BSE': 'KOTAKBANK.BSE',
      'AXISBANK.BSE': 'AXISBANK.BSE',
      'BAJFINANCE.BSE': 'BAJFINANCE.BSE',
      'MARUTI.BSE': 'MARUTI.BSE',
      'HCLTECH.BSE': 'HCLTECH.BSE',
      'WIPRO.BSE': 'WIPRO.BSE',
      'ASIANPAINT.BSE': 'ASIANPAINT.BSE',
      'TITAN.BSE': 'TITAN.BSE',
      'SUNPHARMA.BSE': 'SUNPHARMA.BSE',
      'ULTRACEMCO.BSE': 'ULTRACEMCO.BSE',
      'NESTLEIND.BSE': 'NESTLEIND.BSE',
      'POWERGRID.BSE': 'POWERGRID.BSE'
    };

    const prices = await Promise.all(
      symbols.map(async (symbol: string) => {
        try {
          const mappedSymbol = symbolMap[symbol] || symbol;
          
          // Fetch daily time series data from Alpha Vantage
          const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${mappedSymbol}&apikey=${apiKey}&outputsize=compact`;
          console.log('Fetching from Alpha Vantage:', url.replace(apiKey, 'API_KEY'));
          
          const response = await fetch(url);
          const data = await response.json();
          
          if (data['Error Message'] || data['Note']) {
            console.error('Alpha Vantage error for', symbol, ':', data);
            return { symbol, error: true };
          }

          const timeSeries = data['Time Series (Daily)'];
          if (!timeSeries) {
            console.error('No time series data for', symbol);
            return { symbol, error: true };
          }

          // Get the two most recent trading days
          const dates = Object.keys(timeSeries).sort().reverse();
          const todayData = timeSeries[dates[0]];
          const yesterdayData = timeSeries[dates[1]];

          if (!todayData || !yesterdayData) {
            console.error('Missing data for', symbol);
            return { symbol, error: true };
          }

          const currentPrice = parseFloat(todayData['4. close']);
          const yesterdayPrice = parseFloat(yesterdayData['4. close']);
          const previousClose = yesterdayPrice;
          const high = parseFloat(todayData['2. high']);
          const low = parseFloat(todayData['3. low']);
          const open = parseFloat(todayData['1. open']);
          
          // Calculate today's change
          const change = currentPrice - previousClose;
          const changePercent = (change / previousClose) * 100;
          
          // Simple prediction using 5-day moving average trend
          const last5Prices = dates.slice(0, 5).map(date => parseFloat(timeSeries[date]['4. close']));
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
            high: Math.round(high * 100) / 100,
            low: Math.round(low * 100) / 100,
            open: Math.round(open * 100) / 100,
            timestamp: Date.now() / 1000,
          };
        } catch (error) {
          console.error('Error fetching', symbol, ':', error);
          return { symbol, error: true };
        }
      })
    );
    
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
