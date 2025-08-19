
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
    const endpoint = url.pathname.split('/').pop()

    switch (endpoint) {
      case 'risks': {
        switch (method) {
          case 'GET': {
            const { data, error } = await supabaseClient
              .from('risks')
              .select('*')
              .order('risk_score', { ascending: false })

            if (error) throw error

            return new Response(
              JSON.stringify({ success: true, data: data || [] }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          case 'POST': {
            const body = await req.json()
            
            // Calculate risk score
            const riskScore = (body.probability || 0) * (body.impact || 0)
            
            const { data, error } = await supabaseClient
              .from('risks')
              .insert({
                ...body,
                risk_score: riskScore
              })
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
              throw new Error('Risk ID is required')
            }

            // Recalculate risk score if probability or impact changed
            let updateData = { ...body }
            if (body.probability !== undefined || body.impact !== undefined) {
              const { data: currentRisk } = await supabaseClient
                .from('risks')
                .select('probability, impact')
                .eq('id', id)
                .single()

              if (currentRisk) {
                const probability = body.probability ?? currentRisk.probability
                const impact = body.impact ?? currentRisk.impact
                updateData.risk_score = probability * impact
              }
            }

            const { data, error } = await supabaseClient
              .from('risks')
              .update(updateData)
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
              throw new Error('Risk ID is required')
            }

            const { error } = await supabaseClient
              .from('risks')
              .delete()
              .eq('id', id)

            if (error) throw error

            return new Response(
              JSON.stringify({ success: true, message: 'Risk deleted successfully' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }
        break
      }

      case 'mitigations': {
        switch (method) {
          case 'GET': {
            const riskId = url.searchParams.get('risk_id')
            let query = supabaseClient
              .from('risk_mitigations')
              .select('*')
              .order('created_at', { ascending: false })

            if (riskId) {
              query = query.eq('risk_id', riskId)
            }

            const { data, error } = await query

            if (error) throw error

            return new Response(
              JSON.stringify({ success: true, data: data || [] }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          case 'POST': {
            const body = await req.json()
            
            const { data, error } = await supabaseClient
              .from('risk_mitigations')
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
              throw new Error('Mitigation ID is required')
            }

            const { data, error } = await supabaseClient
              .from('risk_mitigations')
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
        }
        break
      }

      case 'analytics': {
        if (method === 'GET') {
          const { data: risks, error } = await supabaseClient
            .from('risks')
            .select('risk_score, category, status')

          if (error) throw error

          const analytics = {
            totalRisks: risks?.length || 0,
            highRisks: risks?.filter(r => r.risk_score >= 0.7).length || 0,
            mediumRisks: risks?.filter(r => r.risk_score >= 0.3 && r.risk_score < 0.7).length || 0,
            lowRisks: risks?.filter(r => r.risk_score < 0.3).length || 0,
            byCategory: {},
            byStatus: {}
          }

          risks?.forEach(risk => {
            analytics.byCategory[risk.category] = (analytics.byCategory[risk.category] || 0) + 1
            analytics.byStatus[risk.status] = (analytics.byStatus[risk.status] || 0) + 1
          })

          return new Response(
            JSON.stringify({ success: true, data: analytics }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Endpoint not found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
