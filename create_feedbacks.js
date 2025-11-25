// feedbacks 테이블 생성 스크립트
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: 'postgresql://postgres:1111@localhost:5432/gallery_movie_local',
    ssl: false
});

async function createFeedbacksTable() {
    try {
        console.log('📋 feedbacks 테이블 생성 중...\n');
        
        // SQL 파일 읽기
        const sql = fs.readFileSync(path.join(__dirname, 'create_feedbacks_table.sql'), 'utf8');
        
        // 실행
        await pool.query(sql);
        
        console.log('✅ feedbacks 테이블 생성 완료!');
        
        // 확인
        const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'feedbacks'
            ORDER BY ordinal_position
        `);
        
        console.log('\n📊 생성된 테이블 구조:');
        result.rows.forEach(col => {
            console.log(`   - ${col.column_name}: ${col.data_type}`);
        });
        
    } catch (error) {
        console.error('❌ 오류:', error.message);
    } finally {
        await pool.end();
    }
}

createFeedbacksTable();
