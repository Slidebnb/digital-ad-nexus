import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PremiumPaymentRequest {
  planId: string;
  walletAddress: string;
}

const PLATFORM_WALLET = "6rGVhxNk6LrR9SDnVX3aKMYLEYFG7q6KMiKVj6CCsqWz";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Premium payment creation started");

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const user = userData.user;
    console.log("✅ User authenticated:", user.id);

    // Parse request body
    const { planId, walletAddress }: PremiumPaymentRequest = await req.json();
    console.log("📋 Payment request:", { planId, walletAddress });

    // Get plan details
    const { data: plan, error: planError } = await supabaseClient
      .from('premium_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      throw new Error("Plan not found");
    }

    console.log("💎 Plan found:", plan.name, plan.price_sol, "SOL");

    // Check if user already has active premium
    const { data: existingSubscription } = await supabaseClient
      .from('premium_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (existingSubscription) {
      return new Response(JSON.stringify({ 
        error: "Du hast bereits ein aktives Premium-Abonnement" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create pending subscription record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

    const { data: subscription, error: subscriptionError } = await supabaseClient
      .from('premium_subscriptions')
      .insert({
        user_id: user.id,
        plan_type: plan.name,
        status: 'pending',
        price_sol: plan.price_sol,
        price_eur: plan.price_eur,
        solana_wallet_from: walletAddress,
        solana_wallet_to: PLATFORM_WALLET,
        features: plan.features,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (subscriptionError) {
      console.error("❌ Error creating subscription:", subscriptionError);
      throw new Error("Failed to create subscription record");
    }

    console.log("✅ Subscription created:", subscription.id);

    // Return payment details for frontend to process
    const paymentDetails = {
      subscriptionId: subscription.id,
      recipientWallet: PLATFORM_WALLET,
      amount: plan.price_sol,
      currency: "SOL",
      planName: plan.name,
      description: `Premium Subscription - ${plan.name}`,
      reference: subscription.id // For transaction memo
    };

    console.log("💰 Payment details ready:", paymentDetails);

    return new Response(JSON.stringify({
      success: true,
      payment: paymentDetails
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Premium payment error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});