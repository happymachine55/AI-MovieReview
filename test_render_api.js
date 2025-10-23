// Render API 테스트
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🔍 Render API 테스트 시작...\n');
    
    // /api/posts 요청
    console.log('📡 GET /api/posts 요청 중...');
    const response = await fetch('https://ai-moviereview.onrender.com/api/posts');
    
    console.log('📊 응답 상태:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ 응답 성공!');
      console.log('📝 데이터:', JSON.stringify(data, null, 2));
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

testAPI();
