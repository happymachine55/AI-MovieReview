// MySQL posts 테이블 자동 수정
require('dotenv').config();
const mysql = require('mysql2/promise');

const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'gallery_movie'
};

async function fixPostsTable() {
  let connection;
  
  try {
    console.log('🔧 MySQL posts 테이블 수정 중...\n');
    
    connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ MySQL 연결 성공\n');
    
    // 현재 테이블 구조 확인
    console.log('📊 현재 posts 테이블 구조:');
    const [columns] = await connection.execute('DESCRIBE posts');
    console.table(columns.map(c => ({ Field: c.Field, Type: c.Type, Null: c.Null, Default: c.Default })));
    
    // views 컬럼 존재 확인
    const hasViews = columns.some(c => c.Field === 'views');
    const hasRecommend = columns.some(c => c.Field === 'recommend');
    
    if (!hasViews) {
      console.log('\n📝 views 컬럼 추가 중...');
      await connection.execute(
        'ALTER TABLE posts ADD COLUMN views INT DEFAULT 0 AFTER content'
      );
      console.log('✅ views 컬럼 추가 완료');
    } else {
      console.log('\n✅ views 컬럼 이미 존재');
    }
    
    if (!hasRecommend) {
      console.log('\n📝 recommend 컬럼 추가 중...');
      await connection.execute(
        'ALTER TABLE posts ADD COLUMN recommend INT DEFAULT 0 AFTER views'
      );
      console.log('✅ recommend 컬럼 추가 완료');
    } else {
      console.log('\n✅ recommend 컬럼 이미 존재');
    }
    
    // 기존 데이터 업데이트
    console.log('\n📝 기존 데이터 기본값 설정 중...');
    await connection.execute('UPDATE posts SET views = 0 WHERE views IS NULL');
    await connection.execute('UPDATE posts SET recommend = 0 WHERE recommend IS NULL');
    console.log('✅ 기본값 설정 완료');
    
    // 수정 후 테이블 구조 확인
    console.log('\n📊 수정 후 posts 테이블 구조:');
    const [newColumns] = await connection.execute('DESCRIBE posts');
    console.table(newColumns.map(c => ({ Field: c.Field, Type: c.Type, Null: c.Null, Default: c.Default })));
    
    console.log('\n🎉 posts 테이블 수정 완료!');
    console.log('이제 역방향 동기화를 다시 실행하세요: node sync_postgres_to_mysql.js');
    
  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    console.error('상세:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 MySQL 연결 종료');
    }
  }
}

fixPostsTable();
