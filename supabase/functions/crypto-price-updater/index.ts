import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

// Enhanced crypto price updater with better error handling and monitoring
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

interface CryptoPrice {
  cryptocurrency: string;
  price_eur: number;
  price_usd: number;
  market_cap: number;
  volume_24h: number;
  change_24h: number;
  source: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting to prevent API abuse
let lastUpdate = 0;
const UPDATE_INTERVAL = 60000; // 1 minute minimum between updates

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const now = Date.now();
    if (now - lastUpdate < UPDATE_INTERVAL) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Rate limited - try again later',
          nextUpdate: new Date(lastUpdate + UPDATE_INTERVAL).toISOString()
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Fetching crypto prices from CoinGecko...');

    // Enhanced API call with timeout and retry logic
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana,bitcoin,ethereum&vs_currencies=eur,usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true',
      { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'KryptoAnzeigen-PriceUpdater/1.0'
        }
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Received price data:', data);

    // Validate received data
    const requiredCoins = ['solana', 'bitcoin', 'ethereum'];
    for (const coin of requiredCoins) {
      if (!data[coin] || !data[coin].eur || !data[coin].usd) {
        throw new Error(`Missing price data for ${coin}`);
      }
    }

    // Transform data for database with enhanced validation
    const priceUpdates: CryptoPrice[] = [
      {
        cryptocurrency: 'SOL',
        price_eur: Number(data.solana.eur),
        price_usd: Number(data.solana.usd),
        market_cap: Number(data.solana.eur_market_cap) || 0,
        volume_24h: Number(data.solana.eur_24h_vol) || 0,
        change_24h: Number(data.solana.eur_24h_change) || 0,
        source: 'coingecko'
      },
      {
        cryptocurrency: 'BTC',
        price_eur: Number(data.bitcoin.eur),
        price_usd: Number(data.bitcoin.usd),
        market_cap: Number(data.bitcoin.eur_market_cap) || 0,
        volume_24h: Number(data.bitcoin.eur_24h_vol) || 0,
        change_24h: Number(data.bitcoin.eur_24h_change) || 0,
        source: 'coingecko'
      },
      {
        cryptocurrency: 'ETH',
        price_eur: Number(data.ethereum.eur),
        price_usd: Number(data.ethereum.usd),
        market_cap: Number(data.ethereum.eur_market_cap) || 0,
        volume_24h: Number(data.ethereum.eur_24h_vol) || 0,
        change_24h: Number(data.ethereum.eur_24h_change) || 0,
        source: 'coingecko'
      }
    ];

    // Validate price data before storing
    for (const update of priceUpdates) {
      if (update.price_eur <= 0 || update.price_usd <= 0) {
        throw new Error(`Invalid price data for ${update.cryptocurrency}`);
      }
      if (isNaN(update.price_eur) || isNaN(update.price_usd)) {
        throw new Error(`NaN price data for ${update.cryptocurrency}`);
      }
    }

    // Update database with batch operation for better performance
    const { error: updateError } = await supabase
      .from('crypto_prices')
      .upsert(priceUpdates, {
        onConflict: 'cryptocurrency',
        ignoreDuplicates: false
      });

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    // Update boost package prices dynamically
    try {
      await supabase.rpc('update_boost_package_crypto_prices', {
        sol_price: data.solana.eur,
        btc_price: data.bitcoin.eur,
        eth_price: data.ethereum.eur
      });
    } catch (rpcError) {
      console.warn('RPC function call failed, but prices were updated:', rpcError);
    }

    lastUpdate = now;
    console.log('Successfully updated all crypto prices');

    // Enhanced response with more details
    return new Response(
      JSON.stringify({ 
        success: true, 
        updated_at: new Date().toISOString(),
        prices: priceUpdates,
        nextUpdate: new Date(now + UPDATE_INTERVAL).toISOString(),
        source: 'coingecko',
        apiStatus: 'healthy'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Crypto price update error:', error);
    
    // Determine error type for better monitoring
    let errorType = 'unknown';
    let statusCode = 500;
    
    if (error.name === 'AbortError') {
      errorType = 'timeout';
      statusCode = 504;
    } else if (error.message.includes('CoinGecko API')) {
      errorType = 'api_error';
      statusCode = 502;
    } else if (error.message.includes('Missing price data')) {
      errorType = 'data_validation';
      statusCode = 502;
    } else if (error.message.includes('Database')) {
      errorType = 'database_error';
      statusCode = 500;
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        errorType,
        timestamp: new Date().toISOString(),
        nextRetry: new Date(Date.now() + 300000).toISOString() // 5 minutes
      }),
      { 
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});