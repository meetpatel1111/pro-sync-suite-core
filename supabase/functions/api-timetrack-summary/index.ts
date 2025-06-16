
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

    // Get today's entries
    const today = new Date().toISOString().split('T')[0]
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekStartStr = weekStart.toISOString().split('T')[0]

    const { data: todayEntries, error: todayError } = await supabaseClient
      .from('time_entries')
      .select('time_spent, billable')
      .gte('date', today)

    const { data: weekEntries, error: weekError } = await supabaseClient
      .from('time_entries')
      .select('time_spent, billable')
      .gte('date', weekStartStr)

    if (todayError || weekError) throw todayError || weekError

    const totalHoursToday = (todayEntries || []).reduce((sum, entry) => sum + (entry.time_spent / 60), 0)
    const totalHoursWeek = (weekEntries || []).reduce((sum, entry) => sum + (entry.time_spent / 60), 0)
    const billableHoursWeek = (weekEntries || []).filter(e => e.billable).reduce((sum, entry) => sum + (entry.time_spent / 60), 0)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          total_hours_today: Math.round(totalHoursToday * 10) / 10,
          total_hours_week: Math.round(totalHoursWeek * 10) / 10,
          billable_hours_week: Math.round(billableHoursWeek * 10) / 10,
          active_timer: null,
          productivity_score: Math.min(95, Math.max(60, Math.round((billableHoursWeek / Math.max(totalHoursWeek, 1)) * 100)))
        }
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
        data: null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
