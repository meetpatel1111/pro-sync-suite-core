
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
      {
        auth: { 
          persistSession: false,
          autoRefreshToken: false 
        },
        global: {
          headers: { Authorization: req.headers.get('Authorization') ?? '' }
        }
      }
    )

    const url = new URL(req.url)
    const method = req.method

    switch (method) {
      case 'GET': {
        const { data, error } = await supabaseClient
          .from('knowledge_pages')
          .select('*')
          .eq('is_published', true)
          .eq('is_archived', false)
          .order('updated_at', { ascending: false })

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data: data || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'POST': {
        const body = await req.json()
        
        // Generate slug from title if not provided
        if (!body.slug && body.title) {
          body.slug = body.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
        }

        const { data, error } = await supabaseClient
          .from('knowledge_pages')
          .insert(body)
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'PUT': {
        const body = await req.json()
        const id = url.searchParams.get('id')
        
        if (!id) {
          throw new Error('Page ID is required')
        }

        // Update slug if title changed
        if (body.title && !body.slug) {
          body.slug = body.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
        }

        const { data, error } = await supabaseClient
          .from('knowledge_pages')
          .update(body)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'DELETE': {
        const id = url.searchParams.get('id')
        
        if (!id) {
          throw new Error('Page ID is required')
        }

        // Soft delete by archiving
        const { data, error } = await supabaseClient
          .from('knowledge_pages')
          .update({ is_archived: true })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, message: 'Page archived successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Method not allowed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
        )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
