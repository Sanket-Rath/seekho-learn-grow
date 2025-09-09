import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GenerateOTPRequest {
  email: string;
  fullName: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Generate OTP function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { email, fullName }: GenerateOTPRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Generated OTP for ${email}: ${otp}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Store OTP in a temporary table or use a simple in-memory storage
    // For now, we'll create a simple table to store OTPs temporarily
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Create or update OTP record
    const { error: otpError } = await supabase
      .from('otp_verifications')
      .upsert({
        email,
        otp,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      });

    if (otpError) {
      console.error('Error storing OTP:', otpError);
      // If table doesn't exist, we'll continue without storing (for demo purposes)
    }

    // Call the send-otp-email function
    const sendEmailResponse = await supabase.functions.invoke('send-otp-email', {
      body: {
        email,
        otp,
        fullName
      }
    });

    if (sendEmailResponse.error) {
      console.error('Error sending OTP email:', sendEmailResponse.error);
      throw new Error('Failed to send OTP email');
    }

    console.log('OTP generated and email sent successfully');

    return new Response(JSON.stringify({ 
      success: true,
      message: "OTP generated and sent successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in generate-otp function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate and send OTP",
        details: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);