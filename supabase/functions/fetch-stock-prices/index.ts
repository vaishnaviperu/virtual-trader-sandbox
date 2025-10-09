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
    const apiKey = Deno.env.get('FINNHUB_API_KEY');

    if (!apiKey) {
      throw new Error('FINNHUB_API_KEY not configured');
    }

    console.log('Fetching prices for symbols:', symbols);

    // Fetch prices for all symbols in parallel
    const pricePromises = symbols.map(async (symbol: string) => {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
      );
      
      if (!response.ok) {
        console.error(`Error fetching ${symbol}:`, response.statusText);
        return { symbol, error: true };
      }

      const data = await response.json();
      
      return {
        symbol,
        currentPrice: data.c, // Current price
        previousClose: data.pc, // Previous close
        change: data.d, // Change
        changePercent: data.dp, // Change percent
        high: data.h, // High price of the day
        low: data.l, // Low price of the day
        open: data.o, // Open price of the day
        timestamp: data.t, // Timestamp
      };
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
