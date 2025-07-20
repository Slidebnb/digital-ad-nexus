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
    const { paymentId, transactionHash, cryptocurrency, confirmations } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Processing payment: ${paymentId}, TX: ${transactionHash}`)

    // Verify Solana transaction
    let verificationResult;
    if (cryptocurrency === 'SOL') {
      verificationResult = await verifySolanaTransaction(transactionHash);
    } else {
      // For other cryptocurrencies, use existing simulation
      verificationResult = {
        success: Math.random() > 0.1,
        confirmations: Math.floor(Math.random() * 10) + 1,
        blockHeight: Math.floor(Math.random() * 1000000),
        verified: true
      };
    }

    if (!verificationResult.success) {
      // Update payment as failed
      await supabaseClient
        .from('crypto_payments')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)

      return new Response(
        JSON.stringify({ success: false, error: 'Transaction verification failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update confirmation count
    await supabaseClient
      .from('payment_transactions')
      .update({
        confirmation_blocks: verificationResult.confirmations,
        blockchain_status: verificationResult.confirmations >= 3 ? 'confirmed' : 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('crypto_payment_id', paymentId)

    // If enough confirmations, confirm the payment (Solana needs fewer confirmations)
    const requiredConfirmations = cryptocurrency === 'SOL' ? 1 : 3;
    if (verificationResult.confirmations >= requiredConfirmations) {
      const { data: payment } = await supabaseClient
        .from('crypto_payments')
        .select('*')
        .eq('id', paymentId)
        .single()

      if (payment) {
        // Update payment status
        await supabaseClient
          .from('crypto_payments')
          .update({
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
            confirmation_count: verificationResult.confirmations,
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentId)

        // Process the payment action
        await processPaymentAction(supabaseClient, payment)

        // Send notification
        await sendPaymentNotification(supabaseClient, payment, 'confirmed')
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        confirmations: verificationResult.confirmations,
        status: verificationResult.confirmations >= 3 ? 'confirmed' : 'pending'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Payment processing error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function verifySolanaTransaction(txHash: string) {
  try {
    // Use Solana RPC endpoint to verify transaction
    const response = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: [
          txHash,
          {
            encoding: 'json',
            commitment: 'confirmed'
          }
        ]
      })
    });

    const data = await response.json();
    
    if (data.result && data.result.meta && data.result.meta.err === null) {
      // Transaction exists and is successful
      const slot = data.result.slot;
      
      // Get current slot to calculate confirmations
      const currentSlotResponse = await fetch('https://api.mainnet-beta.solana.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSlot',
          params: [{ commitment: 'confirmed' }]
        })
      });

      const currentSlotData = await currentSlotResponse.json();
      const confirmations = currentSlotData.result - slot;

      return {
        success: true,
        confirmations: Math.max(1, confirmations),
        blockHeight: slot,
        verified: true,
        amount: data.result.meta.postBalances?.[1] - data.result.meta.preBalances?.[1] || 0
      };
    }
    
    return {
      success: false,
      confirmations: 0,
      blockHeight: 0,
      verified: false
    };
  } catch (error) {
    console.error('Solana verification error:', error);
    return {
      success: false,
      confirmations: 0,
      blockHeight: 0,
      verified: false
    };
  }
}

async function processPaymentAction(supabaseClient: any, payment: any) {
  switch (payment.payment_type) {
    case 'boost':
      if (payment.ad_id && payment.boost_package_id) {
        await processBoostPayment(supabaseClient, payment)
      }
      break
    case 'premium':
      if (payment.subscription_id) {
        await processPremiumPayment(supabaseClient, payment)
      }
      break
    // Escrow removed per user request
  }
}

async function processBoostPayment(supabaseClient: any, payment: any) {
  // Get boost package details
  const { data: boostPackage } = await supabaseClient
    .from('boost_packages')
    .select('duration_days')
    .eq('id', payment.boost_package_id)
    .single()

  if (boostPackage) {
    const boostEnd = new Date()
    boostEnd.setDate(boostEnd.getDate() + boostPackage.duration_days)

    // Update ad with boost
    await supabaseClient
      .from('ads')
      .update({
        boosted_until: boostEnd.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.ad_id)

    // Create boost record
    await supabaseClient
      .from('boosts')
      .insert({
        user_id: payment.user_id,
        ad_id: payment.ad_id,
        boost_type: 'paid',
        boost_start: new Date().toISOString(),
        boost_end: boostEnd.toISOString()
      })
  }
}

async function processPremiumPayment(supabaseClient: any, payment: any) {
  await supabaseClient
    .from('subscriptions')
    .update({
      status: 'active',
      payment_method: 'crypto',
      updated_at: new Date().toISOString()
    })
    .eq('id', payment.subscription_id)
}


async function sendPaymentNotification(supabaseClient: any, payment: any, status: string) {
  // Create notification record
  await supabaseClient
    .from('notifications')
    .insert({
      user_id: payment.user_id,
      type: 'payment_update',
      title: `Crypto-Zahlung ${status === 'confirmed' ? 'bestätigt' : 'fehlgeschlagen'}`,
      message: `Ihre ${payment.cryptocurrency} Zahlung über €${payment.amount_eur} wurde ${status === 'confirmed' ? 'erfolgreich bestätigt' : 'nicht bestätigt'}.`,
      data: {
        payment_id: payment.id,
        transaction_hash: payment.transaction_hash,
        amount: payment.amount_crypto,
        cryptocurrency: payment.cryptocurrency
      }
    })
}