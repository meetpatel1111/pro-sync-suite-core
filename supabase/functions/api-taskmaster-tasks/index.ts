
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

    const { data: tasks, error } = await supabaseClient
      .from('tasks')
      .select(`
        id,
        title,
        description,
        status,
        priority,
        assignee_id,
        project_id,
        due_date,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return new Response(
      JSON.stringify({
        success: true,
        data: tasks || [],
        total: tasks?.length || 0,
        page: 1,
        per_page: 50
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
