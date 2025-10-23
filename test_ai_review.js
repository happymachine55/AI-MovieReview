// Render AI 리뷰 API 테스트
const fetch = require('node-fetch');

async function testAIReview() {
  try {
    console.log('🔍 Render AI 리뷰 API 테스트 시작...\n');
    
    const testData = {
      movieTitle: '테스트 영화',
      emotions: ['감동', '재미', '긴장'],
      recommend: '추천함',
      score: 8
    };
    
    console.log('📡 POST /api/ai-review 요청 중...');
    console.log('📝 요청 데이터:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('https://ai-moviereview.onrender.com/api/ai-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    console.log('\n📊 응답 상태:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ 응답 성공!');
      console.log('📝 생성된 리뷰:', JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('❌ 응답 실패!');
      console.log('오류 내용:', text);
    }
    
  } catch (error) {
    console.error('❌ 요청 오류:', error.message);
    console.error('상세:', error);
  }
}

testAIReview();
