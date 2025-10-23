// Gemini API 키 직접 테스트
const fetch = require('node-fetch');

async function testGeminiAPI() {
  const apiKey = 'AIzaSyCO-jsOp7AOYLcVoOZ3nH2IMo2oIf2NCtQ';
  
  console.log('🔍 Gemini API 키 테스트...\n');
  console.log('🔑 API 키:', apiKey);
  
  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hello, Gemini!' }] }]
      })
    });
    
    console.log('📊 응답 상태:', response.status, response.statusText);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API 키가 유효합니다!');
      console.log('📝 응답:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ API 키가 유효하지 않습니다!');
      console.log('오류:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  }
}

testGeminiAPI();
