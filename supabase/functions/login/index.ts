import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { username, password } = await req.json();
    
    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: '아이디와 비밀번호를 입력해주세요.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // DB에서 사용자 조회
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: '아이디 또는 비밀번호가 잘못되었습니다.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // 비밀번호 검증 (bcrypt)
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return new Response(
        JSON.stringify({ error: '아이디 또는 비밀번호가 잘못되었습니다.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        user: { 
          id: user.id, 
          username: user.username,
          profile_image: user.profile_image 
        } 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
