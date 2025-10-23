// Render 환경 시뮬레이션 테스트
require('dotenv').config();

console.log('🔍 환경변수 확인...\n');
console.log('GEMINI_API_KEY 존재 여부:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY 길이:', process.env.GEMINI_API_KEY?.length || 0);
console.log('GEMINI_API_KEY 앞 10자:', process.env.GEMINI_API_KEY?.substring(0, 10));
console.log('GEMINI_API_KEY 뒤 10자:', process.env.GEMINI_API_KEY?.substring(process.env.GEMINI_API_KEY.length - 10));

// 공백 체크
if (process.env.GEMINI_API_KEY) {
  const key = process.env.GEMINI_API_KEY;
  console.log('\n🔍 공백 체크:');
  console.log('앞 공백:', key !== key.trimStart() ? '있음 ⚠️' : '없음 ✅');
  console.log('뒤 공백:', key !== key.trimEnd() ? '있음 ⚠️' : '없음 ✅');
  console.log('실제 키:', `"${key}"`);
}
