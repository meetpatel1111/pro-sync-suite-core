
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { data: expenses, error } = await supabaseClient
      .from('expenses')
      .select(`
        id,
        amount,
        currency,
        category_id,
        description,
        project_id,
        date,
        receipt_url,
        user_id,
        created_at,
        status
      `)
      .order('date', { ascending: false })
      .limit(100)

    if (error) throw error

    const totalAmount = (expenses || []).reduce((sum, expense) => sum + Number(expense.amount), 0)

    return new Response(
      JSON.stringify({
        success: true,
        data: expenses || [],
        total: expenses?.length || 0,
        total_amount: Math.round(totalAmount * 100) / 100
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        data: []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
