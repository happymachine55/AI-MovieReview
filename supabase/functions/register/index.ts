import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { username, password, profile_image } = await req.json();
    
    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: '아이디와 비밀번호를 입력해주세요.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (username.length < 3 || username.length > 20) {
      return new Response(
        JSON.stringify({ error: '아이디는 3~20자 사이여야 합니다.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (password.length < 4) {
      return new Response(
        JSON.stringify({ error: '비밀번호는 최소 4자 이상이어야 합니다.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // 중복 체크
    const { data: existing } = await supabaseClient
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ error: '이미 사용 중인 아이디입니다.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
      );
    }

    // 비밀번호 해시 (bcrypt)
    const hashedPassword = await bcrypt.hash(password);

    // 사용자 생성
    const { data: newUser, error: insertError } = await supabaseClient
      .from('users')
      .insert({
        username,
        password: hashedPassword,
        profile_image: profile_image || null,
      })
      .select()
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: newUser.id,
        message: '회원가입이 완료되었습니다.',
        profile_image: newUser.profile_image
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
