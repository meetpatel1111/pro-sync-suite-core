
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.14.0";

serve(async (req) => {
  // Create a Supabase client with the Auth context of the logged in user
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    }
  );

  // Get the authentication data
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  // If no user is found, return an error
  if (!user) {
    return new Response(
      JSON.stringify({ error: "Not authenticated" }),
      { headers: { "Content-Type": "application/json" }, status: 401 }
    );
  }

  try {
    // Parse the request body
    const { type, data } = await req.json();
    
    // Validate based on the type
    let validationResult = { valid: true, error: null };
    
    switch (type) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        validationResult.valid = emailRegex.test(data);
        if (!validationResult.valid) {
          validationResult.error = "Invalid email format";
        }
        break;
      
      case "password":
        // Check if password meets criteria
        validationResult.valid = 
          data.length >= 8 && // At least 8 characters
          /[A-Z]/.test(data) && // Contains uppercase
          /[a-z]/.test(data) && // Contains lowercase
          /[0-9]/.test(data) && // Contains number
          /[^A-Za-z0-9]/.test(data); // Contains special character
        
        if (!validationResult.valid) {
          validationResult.error = 
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
        }
        break;
      
      case "date":
        const date = new Date(data);
        validationResult.valid = !isNaN(date.getTime());
        if (!validationResult.valid) {
          validationResult.error = "Invalid date format";
        }
        break;
      
      default:
        validationResult.valid = false;
        validationResult.error = `Unknown validation type: ${type}`;
    }
    
    return new Response(
      JSON.stringify(validationResult),
      { headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ valid: false, error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 400 }
    );
  }
});
