import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  try {
    if (req.method === 'POST') {
      const { user_id, movie_title, user_review } = await req.json();
      
      if (!user_id) {
        return new Response(
          JSON.stringify({ error: '로그인이 필요합니다.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      if (!movie_title || !user_review) {
        return new Response(
          JSON.stringify({ error: '영화 제목과 리뷰를 입력해주세요.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Gemini API 호출
      const prompt = `다음은 영화 "${movie_title}"에 대한 사용자의 리뷰입니다:\n\n"${user_review}"\n\n이 리뷰를 분석하여 더 풍부하고 전문적인 리뷰를 작성해주세요. 감정, 장르, 연출, 연기, 스토리 등을 평가하고 별점(1-5점)을 제시해주세요. 응답은 JSON 형식으로 다음과 같이 작성해주세요:\n\n{"ai_review": "AI가 생성한 리뷰 내용", "rating": 4.5}`;

      const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!geminiResponse.ok) {
        throw new Error('Gemini API 호출 실패');
      }

      const geminiData = await geminiResponse.json();
      const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // JSON 추출 시도
      let aiReview = aiText;
      let rating = 0;
      
      try {
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          aiReview = parsed.ai_review || aiText;
          rating = parsed.rating || 0;
        }
      } catch (e) {
        console.error('JSON 파싱 실패, 원본 텍스트 사용');
      }

      // DB에 저장 - content에 AI 리뷰 저장
      const { data, error } = await supabaseClient
        .from('reviews')
        .insert({
          user_id,
          movie_title,
          content: aiReview,  // AI가 생성한 리뷰를 content에 저장
          rating,
          recommend: `사용자 리뷰: ${user_review}`  // 사용자의 원본 리뷰는 recommend에 저장
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          id: data.id,
          ai_review: aiReview,
          rating
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method Not Allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
