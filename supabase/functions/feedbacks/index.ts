import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  try {
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const user_id = url.searchParams.get('user_id');
      
      if (!user_id) {
        return new Response(
          JSON.stringify({ error: '로그인이 필요합니다.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      const { data, error } = await supabaseClient
        .from('feedbacks')
        .select(`
          *,
          users (username)
        `)
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'POST') {
      const { user_id, content } = await req.json();
      
      if (!user_id) {
        return new Response(
          JSON.stringify({ error: '로그인이 필요합니다.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      if (!content || !content.trim()) {
        return new Response(
          JSON.stringify({ error: '내용을 입력해주세요.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const { data, error } = await supabaseClient
        .from('feedbacks')
        .insert({ user_id, content })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, id: data.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method Not Allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
