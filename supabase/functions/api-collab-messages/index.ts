
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

    const { data: messages, error } = await supabaseClient
      .from('messages')
      .select(`
        id,
        channel_id,
        user_id,
        content,
        type,
        parent_id,
        mentions,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    const transformedMessages = (messages || []).map(message => ({
      id: message.id,
      channel_id: message.channel_id,
      user_id: message.user_id,
      content: message.content || 'Message content',
      message_type: message.type || 'text',
      thread_id: message.parent_id,
      mentions: message.mentions || [],
      created_at: message.created_at
    }))

    return new Response(
      JSON.stringify({
        success: true,
        data: transformedMessages,
        total: transformedMessages.length
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
