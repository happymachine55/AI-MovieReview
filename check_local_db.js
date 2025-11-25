// 로컬 PostgreSQL 데이터베이스 상태 확인 스크립트
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres:1111@localhost:5432/gallery_movie_local',
    ssl: false
});

async function checkDatabase() {
    try {
        console.log('🔍 로컬 PostgreSQL 데이터베이스 확인 중...\n');
        
        // 1. 데이터베이스 연결 확인
        const connectionTest = await pool.query('SELECT current_database(), version()');
        console.log('✅ 데이터베이스 연결 성공!');
        console.log('   현재 DB:', connectionTest.rows[0].current_database);
        console.log('   버전:', connectionTest.rows[0].version.split(',')[0]);
        console.log('');
        
        // 2. 모든 테이블 목록
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        console.log('📋 테이블 목록:');
        if (tables.rows.length === 0) {
            console.log('   ❌ 테이블이 없습니다!');
        } else {
            tables.rows.forEach(row => {
                console.log(`   - ${row.table_name}`);
            });
        }
        console.log('');
        
        // 3. users 테이블 구조 확인
        const usersColumns = await pool.query(`
            SELECT column_name, data_type, character_maximum_length, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY ordinal_position
        `);
        
        console.log('👤 users 테이블 구조:');
        if (usersColumns.rows.length === 0) {
            console.log('   ❌ users 테이블이 없습니다!');
        } else {
            usersColumns.rows.forEach(col => {
                const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
                const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
                console.log(`   - ${col.column_name}: ${col.data_type}${length} ${nullable}`);
            });
            
            // profile_image 컬럼 확인
            const hasProfileImage = usersColumns.rows.some(col => col.column_name === 'profile_image');
            if (hasProfileImage) {
                console.log('   ✅ profile_image 컬럼 있음');
            } else {
                console.log('   ❌ profile_image 컬럼 없음 - 추가 필요!');
            }
        }
        console.log('');
        
        // 4. feedbacks 테이블 확인
        const feedbacksColumns = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'feedbacks'
            ORDER BY ordinal_position
        `);
        
        console.log('💬 feedbacks 테이블 구조:');
        if (feedbacksColumns.rows.length === 0) {
            console.log('   ❌ feedbacks 테이블이 없습니다 - 생성 필요!');
        } else {
            feedbacksColumns.rows.forEach(col => {
                const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
                console.log(`   - ${col.column_name}: ${col.data_type} ${nullable}`);
            });
            console.log('   ✅ feedbacks 테이블 있음');
        }
        console.log('');
        
        // 5. 데이터 개수 확인
        const counts = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as user_count,
                (SELECT COUNT(*) FROM posts) as post_count,
                (SELECT COUNT(*) FROM reviews) as review_count,
                (SELECT COUNT(*) FROM comments) as comment_count,
                (SELECT COUNT(*) FROM feedbacks) as feedback_count
        `);
        
        console.log('📊 데이터 개수:');
        console.log(`   - 사용자: ${counts.rows[0].user_count}명`);
        console.log(`   - 게시글: ${counts.rows[0].post_count}개`);
        console.log(`   - 리뷰: ${counts.rows[0].review_count}개`);
        console.log(`   - 댓글: ${counts.rows[0].comment_count}개`);
        console.log(`   - 피드백: ${counts.rows[0].feedback_count}개`);
        console.log('');
        
        // 6. 문제점 요약
        console.log('🔧 필요한 작업:');
        
        if (!usersColumns.rows.some(col => col.column_name === 'profile_image')) {
            console.log('   1. ❌ users 테이블에 profile_image 컬럼 추가');
        } else {
            console.log('   1. ✅ profile_image 컬럼 준비됨');
        }
        
        if (feedbacksColumns.rows.length === 0) {
            console.log('   2. ❌ feedbacks 테이블 생성');
        } else {
            console.log('   2. ✅ feedbacks 테이블 준비됨');
        }
        
        console.log('');
        console.log('✨ 데이터베이스 확인 완료!\n');
        
    } catch (error) {
        console.error('❌ 오류 발생:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('   → PostgreSQL 서버가 실행되지 않았습니다.');
        } else if (error.code === '3D000') {
            console.error('   → gallery_movie_local 데이터베이스가 없습니다.');
            console.error('   → 다음 명령으로 생성: CREATE DATABASE gallery_movie_local;');
        } else if (error.code === '28P01') {
            console.error('   → 비밀번호가 틀렸습니다. .env 파일 확인 필요.');
        }
    } finally {
        await pool.end();
    }
}

checkDatabase();
