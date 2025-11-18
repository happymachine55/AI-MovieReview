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
      // 모든 게시글 조회
      const { data, error } = await supabaseClient
        .from('posts')
        .select(`
          *,
          users (username)
        `)
        .order('id', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'POST') {
      const { title, content, user_id } = await req.json();
      
      if (!user_id) {
        return new Response(
          JSON.stringify({ error: '로그인이 필요합니다.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      const { data, error } = await supabaseClient
        .from('posts')
        .insert({ user_id, title, content })
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

      // 작성자 확인
      const { data: post } = await supabaseClient
        .from('posts')
        .select('user_id')
        .eq('id', id)
        .single();

      if (!post || post.user_id !== user_id) {
        return new Response(
          JSON.stringify({ error: '삭제 권한이 없습니다.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }

      await supabaseClient
        .from('posts')
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

