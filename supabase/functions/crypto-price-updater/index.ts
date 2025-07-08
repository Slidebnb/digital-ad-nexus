import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Fetching crypto prices from CoinGecko...')

    // Fetch prices from CoinGecko API
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana,bitcoin,ethereum&vs_currencies=eur,usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'
    )
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('Received price data:', data)

    // Transform data for our database
    const priceUpdates = [
      {
        cryptocurrency: 'SOL',
        price_eur: data.solana.eur,
        price_usd: data.solana.usd,
        market_cap: data.solana.eur_market_cap,
        volume_24h: data.solana.eur_24h_vol,
        change_24h: data.solana.eur_24h_change,
        source: 'coingecko'
      },
      {
        cryptocurrency: 'BTC',
        price_eur: data.bitcoin.eur,
        price_usd: data.bitcoin.usd,
        market_cap: data.bitcoin.eur_market_cap,
        volume_24h: data.bitcoin.eur_24h_vol,
        change_24h: data.bitcoin.eur_24h_change,
        source: 'coingecko'
      },
      {
        cryptocurrency: 'ETH',
        price_eur: data.ethereum.eur,
        price_usd: data.ethereum.usd,
        market_cap: data.ethereum.eur_market_cap,
        volume_24h: data.ethereum.eur_24h_vol,
        change_24h: data.ethereum.eur_24h_change,
        source: 'coingecko'
      }
    ]

    // Update database with new prices
    for (const update of priceUpdates) {
      const { error } = await supabaseClient
        .from('crypto_prices')
        .upsert(update, {
          onConflict: 'cryptocurrency',
          ignoreDuplicates: false
        })

      if (error) {
        console.error(`Error updating ${update.cryptocurrency}:`, error)
        throw error
      }
    }

    // Update boost package prices dynamically
    await supabaseClient.rpc('update_boost_package_crypto_prices', {
      sol_price: data.solana.eur,
      btc_price: data.bitcoin.eur,
      eth_price: data.ethereum.eur
    })

    console.log('Successfully updated all crypto prices')

    return new Response(
      JSON.stringify({ 
        success: true, 
        updated_at: new Date().toISOString(),
        prices: priceUpdates
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Crypto price update error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})