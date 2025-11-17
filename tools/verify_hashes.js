// verify_hashes.js
// 목적: 로컬에서 제공된 평문과 bcrypt 해시를 비교하여 MATCH 여부를 출력합니다.
// 사용법: 프로젝트 루트에서 `node tools\verify_hashes.js` 실행

const bcrypt = require('bcrypt');

const tests = [
  { username: 'user1', plain: '2222', hash: '$2b$10$8Gx/KTiVk3WDjARWyOLdHOgA0AIGxySnvM21va.srYyvhmmjarZJq' },
  { username: 'user2', plain: '3333', hash: '$2b$10$XaDzhGv5o6RdTaPWtnYDrO3srE2zGV05dTuLIB2l3O5A2xkFET7jK' },
  { username: 'user3', plain: '1111', hash: '$2b$10$vCj3CW8fKo3AX1HOMoLsR.k/TYvDTBEHVURa3MVnelv7HyZT9t1Cu' }
];

(async () => {
  for (const t of tests) {
    try {
      const ok = await bcrypt.compare(t.plain, t.hash);
      console.log(`${t.username}: plain='${t.plain}' => ${ok ? 'MATCH' : 'NO MATCH'}`);
    } catch (err) {
      console.error(`${t.username}: Error verifying -`, err.message || err);
    }
  }
})();
