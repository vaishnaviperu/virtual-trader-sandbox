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
    console.log('Fetching prices for symbols:', symbols);

    // Realistic base prices for Indian companies (in ₹)
    const basePrices: Record<string, number> = {
      'RELIANCE.BSE': 2450.50,
      'TCS.BSE': 3850.75,
      'HDFCBANK.BSE': 1650.25,
      'INFY.BSE': 1520.80,
      'HINDUNILVR.BSE': 2380.40,
      'ICICIBANK.BSE': 1085.60,
      'BHARTIARTL.BSE': 1550.30,
      'ITC.BSE': 465.90,
      'SBIN.BSE': 785.45,
      'LT.BSE': 3580.20,
      'KOTAKBANK.BSE': 1750.85,
      'AXISBANK.BSE': 1125.70,
      'BAJFINANCE.BSE': 7250.35,
      'MARUTI.BSE': 12850.60,
      'HCLTECH.BSE': 1780.95,
      'WIPRO.BSE': 565.40,
      'ASIANPAINT.BSE': 2850.75,
      'TITAN.BSE': 3420.50,
      'SUNPHARMA.BSE': 1685.30,
      'ULTRACEMCO.BSE': 10250.80,
      'NESTLEIND.BSE': 2450.65,
      'POWERGRID.BSE': 325.40,
    };

    // Generate realistic stock data with yesterday, today, and tomorrow predictions
    const prices = symbols.map((symbol: string) => {
      try {
        const basePrice = basePrices[symbol] || 1000;
        
        // Generate yesterday's price (random -2% to +2% from base)
        const yesterdayVariation = (Math.random() - 0.5) * 0.04;
        const yesterdayPrice = basePrice * (1 + yesterdayVariation);
        
        // Generate today's price (random -1.5% to +1.5% from yesterday)
        const todayVariation = (Math.random() - 0.5) * 0.03;
        const currentPrice = yesterdayPrice * (1 + todayVariation);
        
        // Calculate today's metrics
        const previousClose = yesterdayPrice;
        const change = currentPrice - previousClose;
        const changePercent = (change / previousClose) * 100;
        
        // Generate high and low for today
        const volatility = Math.abs(todayVariation) * 1.5;
        const high = currentPrice * (1 + volatility);
        const low = currentPrice * (1 - volatility);
        const open = yesterdayPrice * (1 + (Math.random() - 0.5) * 0.01);
        
        // Predict tomorrow's price using momentum and mean reversion
        const momentum = todayVariation * 0.5; // 50% momentum continuation
        const meanReversion = (basePrice - currentPrice) / basePrice * 0.3; // 30% mean reversion
        const randomFactor = (Math.random() - 0.5) * 0.02; // Random noise
        const tomorrowPredicted = currentPrice * (1 + momentum + meanReversion + randomFactor);
        
        // Generate realistic volume (in thousands)
        const volume = Math.floor(Math.random() * 5000000) + 1000000;

        console.log(`${symbol}: Yesterday=₹${yesterdayPrice.toFixed(2)}, Today=₹${currentPrice.toFixed(2)}, Tomorrow(Predicted)=₹${tomorrowPredicted.toFixed(2)}`);

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
          volume,
          timestamp: Date.now() / 1000,
        };
      } catch (error) {
        console.error('Error generating data for', symbol, ':', error);
        return { symbol, error: true };
      }
    });

    /* 
    // Alpha Vantage Integration (kept for future use)
    // Uncomment and configure ALPHA_VANTAGE_API_KEY secret to use real data
    
    const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
    if (apiKey) {
      const symbolMap: Record<string, string> = {
        'RELIANCE.BSE': 'RELIANCE.NS',
        // ... map other symbols to NSE format
      };
      
      const prices = await Promise.all(
        symbols.map(async (symbol: string) => {
          const mappedSymbol = symbolMap[symbol] || symbol;
          const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${mappedSymbol}&apikey=${apiKey}`;
          // ... Alpha Vantage fetch logic
        })
      );
    }
    */
    
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
