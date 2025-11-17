// 안전한 비밀번호 검증 스크립트 (Postgres용)
// 사용법:
// 1) 프로젝트 폴더에 있는 .env가 올바르게 설정되어 있어야 합니다.
// 2) node tools/check_passwords.js 를 실행하면 users 테이블의 해시와
//    candidates 객체에 넣은 평문을 bcrypt.compare로 검사합니다.

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 확인하고 싶은 평문 비밀번호 목록 (예시)
// 주의: 여기에 '해시' 문자열을 넣는 것이 아니라, 사용자가 입력했거나
// 관리자(본인)가 확인하려는 '평문'(plaintext)을 넣어야 합니다.
// 예: user1의 실제 비밀번호가 2222라면 user1: '2222'로 넣으세요.
// 실제 운영에서는 평문을 코드에 하드코딩하거나 로그에 남기지 마세요.
const candidates = {
  user1: '2222',
  user2: '3333',
  user3: '1111'
};

// 대안(대량 검사): 후보 비밀번호를 파일에 한 줄씩 저장한 후
// 이 스크립트를 확장해 파일을 읽고 각 후보마다 bcrypt.compare를 실행하면
// 어떤 후보가 해당 해시와 일치하는지 찾을 수 있습니다.
// (브루트포스/dictionary 공격은 계산 비용/법적/윤리적 이슈가 있으니
// 실제로 실행하기 전 반드시 소유권/목적을 확인하세요.)

(async () => {
  try {
    const res = await pool.query('SELECT id, username, password FROM users ORDER BY id ASC');
    for (const row of res.rows) {
      const username = row.username;
      const hash = row.password;
      if (!hash) {
        console.log(`${username}: no password hash stored`);
        continue;
      }
      if (candidates[username]) {
        const ok = await bcrypt.compare(candidates[username], hash);
        console.log(`${username}: candidate[${candidates[username]}] => ${ok ? 'MATCH' : 'NO MATCH'}`);
      } else {
        console.log(`${username}: no candidate provided (hash starts with: ${hash.slice(0,7)})`);
      }
    }
  } catch (err) {
    console.error('Error checking passwords:', err.message || err);
  } finally {
    await pool.end();
  }
})();
