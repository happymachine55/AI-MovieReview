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

      // prompt 구성: 3가지 스타일의 리뷰와 JSON 응답 요구
      const prompt = `영화 "${movie_title}"에 대한 관람평을 3가지 다른 스타일로 작성해줘.
사용자 입력:
- 감정 키워드: ${(emotions?.join?.(', ') || '')}
- 평점: ${score ?? ''}/10
- 추천 여부: ${recommend ?? ''}

요구사항:
1) 감정적 스타일 (150~200자)
2) 분석적 스타일 (150~200자)
3) 한줄평 스타일 (50~100자)

반드시 아래 JSON 포맷으로만 답해. 다른 설명 금지.
{
  "reviews": [
    {"style": "감정적", "content": "..."},
    {"style": "분석적", "content": "..."},
    {"style": "한줄평", "content": "..."}
  ]
}`;

      const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
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
