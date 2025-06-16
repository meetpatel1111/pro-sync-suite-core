
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

    const { data: channels, error } = await supabaseClient
      .from('channels')
      .select(`
        id,
        name,
        description,
        type,
        created_by,
        created_at,
        project_id,
        about
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get member counts for each channel
    const channelsWithCounts = await Promise.all((channels || []).map(async (channel) => {
      const { data: messages, error: msgError } = await supabaseClient
        .from('messages')
        .select('user_id')
        .eq('channel_id', channel.id)

      const uniqueMembers = new Set((messages || []).map(m => m.user_id)).size

      return {
        ...channel,
        member_count: Math.max(1, uniqueMembers) // At least 1 (creator)
      }
    }))

    return new Response(
      JSON.stringify({
        success: true,
        data: channelsWithCounts,
        total: channelsWithCounts.length
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
