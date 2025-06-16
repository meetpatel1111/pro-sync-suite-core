
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

    const { data: budgets, error } = await supabaseClient
      .from('budgets')
      .select(`
        id,
        project_id,
        total,
        spent,
        updated_at
      `)
      .order('updated_at', { ascending: false })

    if (error) throw error

    const transformedBudgets = (budgets || []).map(budget => ({
      id: budget.id,
      project_id: budget.project_id,
      total_budget: Number(budget.total || 0),
      spent_amount: Number(budget.spent || 0),
      remaining_amount: Number(budget.total || 0) - Number(budget.spent || 0),
      currency: "USD",
      period: "monthly",
      status: Number(budget.spent || 0) > Number(budget.total || 0) * 0.9 ? "over-budget" : "on-track",
      created_at: budget.updated_at
    }))

    return new Response(
      JSON.stringify({
        success: true,
        data: transformedBudgets,
        total: transformedBudgets.length
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
