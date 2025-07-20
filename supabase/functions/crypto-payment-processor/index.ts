
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
    const { paymentId, blockchain, amount, walletAddress } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Auto-processing payment: ${paymentId} on ${blockchain}`)

    // Get payment details
    const { data: payment } = await supabaseClient
      .from('crypto_payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (!payment) {
      throw new Error('Payment not found')
    }

    // Verify Solana transaction automatically
    let verificationResult;
    if (blockchain === 'solana') {
      verificationResult = await verifySolanaTransactionByAmount(
        payment.wallet_address, 
        payment.amount_crypto,
        payment.created_at
      );
    } else {
      verificationResult = {
        success: false,
        error: 'Unsupported blockchain'
      };
    }

    if (!verificationResult.success) {
      console.log('Payment verification failed:', verificationResult.error);
      return new Response(
        JSON.stringify({ success: false, error: 'Transaction not found or invalid' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update payment as confirmed
    await supabaseClient
      .from('crypto_payments')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        transaction_hash: verificationResult.transactionHash,
        confirmation_count: verificationResult.confirmations || 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)

    // Create transaction record
    await supabaseClient
      .from('payment_transactions')
      .insert({
        crypto_payment_id: paymentId,
        transaction_hash: verificationResult.transactionHash,
        blockchain_status: 'confirmed',
        confirmation_blocks: verificationResult.confirmations || 1
      })

    // Process the payment action
    await processPaymentAction(supabaseClient, payment)

    // Send success notification
    await sendPaymentNotification(supabaseClient, payment, 'confirmed')

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: 'confirmed',
        transactionHash: verificationResult.transactionHash
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Auto payment processing error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function verifySolanaTransactionByAmount(walletAddress: string, expectedAmount: number, since: string) {
  try {
    // Get recent transactions for the wallet
    const response = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getSignaturesForAddress',
        params: [
          walletAddress,
          {
            limit: 10,
            before: null
          }
        ]
      })
    });

    const signaturesData = await response.json();
    
    if (!signaturesData.result) {
      return { success: false, error: 'No transactions found' };
    }

    // Check each transaction for the expected amount
    for (const sigInfo of signaturesData.result) {
      const txResponse = await fetch('https://api.mainnet-beta.solana.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTransaction',
          params: [
            sigInfo.signature,
            {
              encoding: 'json',
              commitment: 'confirmed'
            }
          ]
        })
      });

      const txData = await txResponse.json();
      
      if (txData.result && txData.result.meta && txData.result.meta.err === null) {
        // Check if transaction amount matches expected amount (within tolerance)
        const postBalances = txData.result.meta.postBalances;
        const preBalances = txData.result.meta.preBalances;
        
        if (postBalances && preBalances && postBalances.length > 1 && preBalances.length > 1) {
          const receivedAmount = (postBalances[1] - preBalances[1]) / 1000000000; // Convert lamports to SOL
          const tolerance = 0.0001; // Allow small differences due to fees
          
          if (Math.abs(receivedAmount - expectedAmount) <= tolerance) {
            // Check if transaction is recent enough
            const txTime = txData.result.blockTime * 1000;
            const paymentTime = new Date(since).getTime();
            
            if (txTime >= paymentTime - 60000) { // 1 minute tolerance
              return {
                success: true,
                transactionHash: sigInfo.signature,
                confirmations: 1,
                blockTime: txTime,
                amount: receivedAmount
              };
            }
          }
        }
      }
    }
    
    return { success: false, error: 'No matching transaction found' };
  } catch (error) {
    console.error('Solana verification error:', error);
    return { success: false, error: error.message };
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
      title: `Automatische ${payment.cryptocurrency} Zahlung ${status === 'confirmed' ? 'bestätigt' : 'fehlgeschlagen'}`,
      message: `Ihre automatische ${payment.cryptocurrency} Zahlung über €${payment.amount_eur} wurde ${status === 'confirmed' ? 'erfolgreich verarbeitet' : 'nicht bestätigt'}.`,
      data: {
        payment_id: payment.id,
        amount: payment.amount_crypto,
        cryptocurrency: payment.cryptocurrency
      }
    })
}
