import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyPaymentRequest {
  subscriptionId: string;
  transactionSignature: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔍 Premium payment verification started");

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
    const { subscriptionId, transactionSignature }: VerifyPaymentRequest = await req.json();
    console.log("📋 Verification request:", { subscriptionId, transactionSignature });

    // Get subscription record
    const { data: subscription, error: subscriptionError } = await supabaseClient
      .from('premium_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single();

    if (subscriptionError || !subscription) {
      throw new Error("Subscription not found");
    }

    console.log("💎 Subscription found:", subscription.plan_type);

    // TODO: In production, verify transaction on Solana blockchain
    // For now, we'll trust the frontend verification
    
    // Update subscription to active
    const { error: updateError } = await supabaseClient
      .from('premium_subscriptions')
      .update({
        status: 'active',
        transaction_signature: transactionSignature,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId);

    if (updateError) {
      console.error("❌ Error updating subscription:", updateError);
      throw new Error("Failed to activate subscription");
    }

    // Update user profile with premium status
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({
        verification_level: 'premium',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (profileError) {
      console.warn("⚠️ Error updating profile (non-critical):", profileError);
    }

    console.log("✅ Premium subscription activated successfully");

    return new Response(JSON.stringify({
      success: true,
      message: "Premium-Abonnement erfolgreich aktiviert!",
      subscription: {
        id: subscription.id,
        plan: subscription.plan_type,
        status: 'active',
        expires_at: subscription.expires_at
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Premium verification error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});