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
    if (req.method === 'POST') {
      const { user_id, target_id, like_type } = await req.json();
      
      if (!user_id) {
        return new Response(
          JSON.stringify({ error: '로그인이 필요합니다.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      if (!target_id || !like_type) {
        return new Response(
          JSON.stringify({ error: '필수 정보가 누락되었습니다.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const tableName = like_type === 'review' ? 'review_likes' : 'post_likes';
      const columnName = like_type === 'review' ? 'review_id' : 'post_id';

      // 기존 좋아요 확인
      const { data: existing } = await supabaseClient
        .from(tableName)
        .select('*')
        .eq('user_id', user_id)
        .eq(columnName, target_id)
        .single();

      if (existing) {
        // 이미 좋아요 있으면 삭제 (토글)
        const { error: deleteError } = await supabaseClient
          .from(tableName)
          .delete()
          .eq('user_id', user_id)
          .eq(columnName, target_id);

        if (deleteError) throw deleteError;

        return new Response(
          JSON.stringify({ success: true, action: 'removed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // 좋아요 추가
        const insertData = { user_id, [columnName]: target_id };
        const { error: insertError } = await supabaseClient
          .from(tableName)
          .insert(insertData);

        if (insertError) throw insertError;

        return new Response(
          JSON.stringify({ success: true, action: 'added' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const target_id = url.searchParams.get('target_id');
      const like_type = url.searchParams.get('like_type');
      
      if (!target_id || !like_type) {
        return new Response(
          JSON.stringify({ error: '필수 정보가 누락되었습니다.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const tableName = like_type === 'review' ? 'review_likes' : 'post_likes';
      const columnName = like_type === 'review' ? 'review_id' : 'post_id';

      const { count, error } = await supabaseClient
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .eq(columnName, target_id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ count: count || 0 }),
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
