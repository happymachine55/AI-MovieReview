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
      const post_id = url.searchParams.get('post_id');
      
      const { data, error } = await supabaseClient
        .from('comments')
        .select(`
          *,
          users (username)
        `)
        .eq('post_id', post_id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'POST') {
      const { post_id, user_id, content } = await req.json();
      
      if (!user_id) {
        return new Response(
          JSON.stringify({ error: '로그인이 필요합니다.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      const { data, error } = await supabaseClient
        .from('comments')
        .insert({ post_id, user_id, content })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ id: data.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const id = url.pathname.split('/').pop();
      const { user_id } = await req.json();

      if (!user_id) {
        return new Response(
          JSON.stringify({ error: '로그인이 필요합니다.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      const { data: comment } = await supabaseClient
        .from('comments')
        .select('user_id')
        .eq('id', id)
        .single();

      if (!comment || comment.user_id !== user_id) {
        return new Response(
          JSON.stringify({ error: '삭제 권한이 없습니다.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }

      await supabaseClient
        .from('comments')
        .delete()
        .eq('id', id);

      return new Response(
        JSON.stringify({ success: true }),
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

