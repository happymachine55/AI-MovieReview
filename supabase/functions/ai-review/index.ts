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
      const { user_id, movie_title, user_review, emotions, score, recommend } = await req.json();

      if (!user_id) {
        return new Response(
          JSON.stringify({ error: '로그인이 필요합니다.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      if (!movie_title) {
        return new Response(
          JSON.stringify({ error: '영화 제목이 필요합니다.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // prompt 구성: 상세한 3가지 스타일의 리뷰 생성
      const emotionList = emotions?.join?.(', ') || '';
      const prompt = `영화 "${movie_title}"에 대한 관람평을 3개 생성해 주세요.

조건:
- 감정 키워드: ${emotionList} (최대 10개)
- 추천 여부: ${recommend ?? ''}
- 평점: ${score ?? ''}점(1~10점)
- 각 관람평은 반드시 서로 다른 시각, 다른 문장 구조, 다른 포인트로 작성해주세요. 예를 들어, 한 리뷰는 연출에, 한 리뷰는 캐릭터에, 한 리뷰는 분위기에 집중해 주세요.
- 감정 키워드에는 별표(*)나 굵게(**) 표시를 사용하지 마세요.
- 감정 키워드는 관람평 끝에 나열하지 말고, 문장 안에 자연스럽게 녹여서 써주세요.
- 평점을 쓸때 평점은 10점 만점에 몇점 입니다 라는 말로 써주세요.
- 각 관람평은 영화제목, 감정, 추천, 평점이 자연스럽게 포함되어야 하며, 공백 제외 200바이트 내외로 아주 짧게 작성.
- 감정형용사, 부사, 생생한 묘사를 활용해 주세요.

출력 형식:
반드시 아래 JSON 포맷으로만 답해주세요. 다른 설명이나 마크다운 코드 블록은 넣지 마세요.
{
  "reviews": [
    {"style": "감정적", "content": "첫 번째 리뷰 내용"},
    {"style": "분석적", "content": "두 번째 리뷰 내용"},
    {"style": "한줄평", "content": "세 번째 리뷰 내용"}
  ]
}`;

      const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 1500,
            temperature: 1.2  // 창의성 높임
          }
        })
      });

      if (!geminiResponse.ok) {
        const text = await geminiResponse.text();
        throw new Error(`Gemini API 호출 실패: ${text}`);
      }

      const geminiData = await geminiResponse.json();
      const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

      let reviews: Array<{ style: string; content: string }> = [];
      try {
        const m = aiText.match(/\{[\s\S]*\}/);
        if (m) {
          const parsed = JSON.parse(m[0]);
          reviews = parsed.reviews || [];
        }
      } catch (_e) {
        console.error('AI 응답 JSON 파싱 실패:', _e);
      }

      return new Response(
        JSON.stringify({ success: true, reviews }),
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
