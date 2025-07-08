import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  const { headers } = req
  const upgradeHeader = headers.get("upgrade") || ""

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 })
  }

  const { socket, response } = Deno.upgradeWebSocket(req)
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  socket.onopen = () => {
    console.log("WebSocket connection opened")
    
    // Start monitoring crypto prices and payments
    startMonitoring(socket, supabaseClient)
  }

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data)
      console.log("Received message:", message)
      
      switch (message.type) {
        case 'subscribe_prices':
          await subscribeToPrice(socket, supabaseClient, message.cryptocurrency)
          break
        case 'subscribe_payment':
          await subscribeToPayment(socket, supabaseClient, message.paymentId)
          break
        case 'ping':
          socket.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }))
          break
      }
    } catch (error) {
      console.error("WebSocket message error:", error)
      socket.send(JSON.stringify({ type: 'error', message: error.message }))
    }
  }

  socket.onclose = () => {
    console.log("WebSocket connection closed")
  }

  socket.onerror = (error) => {
    console.error("WebSocket error:", error)
  }

  return response
})

async function startMonitoring(socket: WebSocket, supabaseClient: any) {
  // Monitor crypto prices every 30 seconds
  const priceInterval = setInterval(async () => {
    try {
      const { data: prices } = await supabaseClient
        .from('crypto_prices')
        .select('*')
        .in('cryptocurrency', ['SOL', 'BTC', 'ETH'])

      if (prices && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'price_update',
          data: prices,
          timestamp: Date.now()
        }))
      }
    } catch (error) {
      console.error('Price monitoring error:', error)
    }
  }, 30000)

  // Monitor pending payments every 10 seconds
  const paymentInterval = setInterval(async () => {
    try {
      const { data: payments } = await supabaseClient
        .from('crypto_payments')
        .select(`
          *,
          payment_transactions(*)
        `)
        .eq('status', 'pending')
        .lt('created_at', new Date(Date.now() + 30 * 60 * 1000).toISOString()) // Not expired

      if (payments && socket.readyState === WebSocket.OPEN) {
        for (const payment of payments) {
          // Simulate blockchain check
          if (payment.transaction_hash) {
            const confirmations = await checkTransactionConfirmations(payment.transaction_hash, payment.cryptocurrency)
            
            socket.send(JSON.stringify({
              type: 'payment_update',
              data: {
                payment_id: payment.id,
                confirmations: confirmations,
                status: confirmations >= 3 ? 'confirmed' : 'pending'
              },
              timestamp: Date.now()
            }))
          }
        }
      }
    } catch (error) {
      console.error('Payment monitoring error:', error)
    }
  }, 10000)

  // Clean up intervals when socket closes
  socket.addEventListener('close', () => {
    clearInterval(priceInterval)
    clearInterval(paymentInterval)
  })
}

async function subscribeToPrice(socket: WebSocket, supabaseClient: any, cryptocurrency: string) {
  const { data: price } = await supabaseClient
    .from('crypto_prices')
    .select('*')
    .eq('cryptocurrency', cryptocurrency)
    .single()

  if (price && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'price_subscription',
      data: price,
      timestamp: Date.now()
    }))
  }
}

async function subscribeToPayment(socket: WebSocket, supabaseClient: any, paymentId: string) {
  const { data: payment } = await supabaseClient
    .from('crypto_payments')
    .select(`
      *,
      payment_transactions(*)
    `)
    .eq('id', paymentId)
    .single()

  if (payment && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'payment_subscription',
      data: payment,
      timestamp: Date.now()
    }))
  }
}

async function checkTransactionConfirmations(txHash: string, crypto: string): Promise<number> {
  // Simulate blockchain API calls
  // In production, integrate with actual blockchain APIs
  return Math.floor(Math.random() * 10) + 1
}