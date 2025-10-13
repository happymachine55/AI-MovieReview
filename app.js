require('dotenv').config();
// app.js
const path = require('path');
const express = require('express');
const fetch = require('node-fetch');
const pool = require('./db.js');

const app = express();
app.use(express.json());

// ✅ 세션 관리 추가
const session = require('express-session');
app.use(session({
    secret: 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24시간
}));

// 정적 파일 제공 (frontend 폴더를 public으로 사용)
app.use(express.static(path.join(__dirname, 'frontend')));

// ✅✅✅ 여기에 로그인/로그아웃 API 추가 (기존 API 엔드포인트 이전) ✅✅✅
// 로그인 API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    pool.query('SELECT * FROM users WHERE username = ? AND password = ?', 
        [username, password], 
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            
            if (results.length === 0) {
                return res.status(401).json({ error: '아이디 또는 비밀번호가 잘못되었습니다.' });
            }
            
            const user = results[0];
            req.session.userId = user.id;
            req.session.username = user.username;
            
            res.json({ success: true, user: { id: user.id, username: user.username } });
        }
    );
});

// 로그아웃 API
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// 현재 로그인 상태 확인 API
app.get('/api/me', (req, res) => {
    if (req.session.userId) {
        res.json({ 
            loggedIn: true, 
            user: { 
                id: req.session.userId, 
                username: req.session.username 
            } 
        });
    } else {
        res.json({ loggedIn: false });
    }
});

app.get('/api/posts', (req, res) => {
  pool.query('SELECT * FROM posts ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET /api/posts/:id
app.get('/api/posts/:id', (req, res) => {
  pool.query('SELECT * FROM posts WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(results[0]);
  });
});
//posts 게시판 삭제
app.delete('/api/posts/:id', (req, res) => {
    // ✅ 로그인 체크 추가
    if (!req.session.userId) {
        return res.status(401).json({ error: '로그인이 필요합니다.' });
    }
    const postId = req.params.id;
    // ✅ 먼저 작성자 확인
    pool.query('SELECT user_id FROM posts WHERE id = ?', [postId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Not found' });
        
        // ✅ 본인이 작성한 글인지 확인
        if (results[0].user_id !== req.session.userId) {
            return res.status(403).json({ error: '삭제 권한이 없습니다.' });
        }
        
        // ✅ 본인 글이면 삭제
        pool.query('DELETE FROM posts WHERE id = ?', [postId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
});
// 리뷰 저장 API
app.post('/api/reviews', (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }
    const { movie_title, user_id, rating, content, recommend } = req.body;
    const userId = req.session.userId; // ✅ 세션에서만 가져옴
    const sql = 'INSERT INTO reviews (movie_title, user_id, rating, content, recommend, created_at) VALUES (?, ?, ?, ?, ?, NOW())';
    pool.query(sql, [movie_title, user_id, rating, content, recommend], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId });
    });
  });
  
// 리뷰 삭제 API (app.js)
app.delete('/api/reviews/:id', (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }
    
  const reviewId = req.params.id;
    // ✅ 먼저 작성자 확인
    pool.query('SELECT user_id FROM reviews WHERE id = ?', [reviewId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Not found' });
        
        // ✅ 본인이 작성한 리뷰인지 확인
        if (results[0].user_id !== req.session.userId) {
            return res.status(403).json({ error: '삭제 권한이 없습니다.' });
        }
        
        // ✅ 본인 리뷰면 삭제
        pool.query('DELETE FROM reviews WHERE id = ?', [reviewId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
});

app.post('/api/ai-review', async (req, res) => {
  const { movieTitle, emotions, recommend, score } = req.body;

  // 프롬프트 생성
  function makePrompt({ title, emotions, recommend, score }) {
    return (
      `영화 "${title}"에 대한 관람평을 3개 생성해 주세요.\n` +
      `조건:\n` +
      `- 감정 키워드: ${emotions.join(", ")} (최대 10개)\n` +
      `- 추천 여부: ${recommend}\n` +
      `- 평점: ${score}점(1~10점)\n` +
      `- 각 관람평은 반드시 서로 다른 시각, 다른 문장 구조, 다른 포인트로 작성해주세요. 예를 들어, 한 리뷰는 연출에, 한 리뷰는 캐릭터에, 한 리뷰는 분위기에 집중해 주세요.\n` +
      `- 감정 키워드에는 별표(*)나 굵게(**) 표시를 사용하지 마세요.\n` +
      `- 감정 키워드는 관람평 끝에 나열하지 말고, 문장 안에 자연스럽게 녹여서 써주세요.\n` +
      `- 평점을 쓸때 평점은 10점 만점에 몇점 입니다 라는 말로 써주세요.\n` +
      `- 각 관람평은 영화제목, 감정, 추천, 평점이 자연스럽게 포함되어야 하며, 공백 제외 200바이트 내외로 아주 짧게 작성.\n` + // 200바이트로 확 줄임
      `- 감정형용사, 부사, 생생한 묘사를 활용해 주세요.\n` +
      `- 출력은 1, 2, 3 순서로 관람평만 출력하세요. 키워드에 별표나 강조 기호를 붙이지 마세요.\n`
    );
  }
  // function makePrompt({ title, emotions, recommend, score }) {
  //   return (
  //     `영화 "${title}"에 대한 관람평을 3개 생성해 주세요.\n` +
  //     `조건:\n` +
  //     `- 감정 키워드: ${emotions.join(", ")} (최대 10개)\n` +
  //     `- 추천 여부: ${recommend}\n` +
  //     `- 평점: ${score}점(1~10점)\n` +
      // `- 각 관람평은 영화제목, 감정, 추천, 평점이 자연스럽게 포함되어야 하며, 공백 제외 200바이트 내외로 아주 짧게 작성.\n` + // 200바이트로 확 줄임
      // `- 감정 키워드에는 별표(*)나 굵게(**) 표시를 사용하지 마세요.\n` +
  //     `- 감정형용사, 부사, 생생한 묘사를 활용해 주세요.\n` +
  //     `- 출력은 1, 2, 3 순서로 관람평만 출력하세요. 키워드에 별표나 강조 기호를 붙이지 마세요.\n`
  //   );
  // }
  

  const prompt = makePrompt({ title: movieTitle, emotions, recommend, score });
  const apiKey = process.env.GEMINI_API_KEY; // 반드시 본인 키로 변경
  if (!apiKey) {
    return res.status(500).json({ error: 'API 키가 .env 파일에 설정되지 않았습니다.' });
  }

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;
    
    const geminiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 1500,
          temperature: 1.2
        }
      })
    });
    
    // const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     contents: [{ parts: [{ text: prompt }] }],
    //     generationConfig: { maxOutputTokens: 1500 }
    //   })
    // });

    const geminiData = await geminiRes.json();
    if (geminiData.error) {
        console.error("Gemini API Error:", geminiData.error);
        return res.status(500).json({ error: geminiData.error.message });
    }
    // let text = '';
    // if (geminiData.candidates && geminiData.candidates[0]?.content?.parts[0]?.text) {
    //   text = geminiData.candidates[0].content.parts[0].text;
    // } else {
    //   text = JSON.stringify(geminiData);
    // }

     const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(geminiData);
    // 관람평 3개 추출 (1. ... 2. ... 3. ... 형식)
    const reviews = text
      .split(/\n\d+\./)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    res.json({ reviews });
  } catch (err) {
    console.error("Gemini API 호출 오류:", err);
    res.status(500).json({ error: 'Gemini API 호출 실패', detail: err.message });
  }
});


// app.js
app.post('/api/posts', (req, res) => {
    // ✅ 로그인 체크 추가
    if (!req.session.userId) {
        return res.status(401).json({ error: '로그인이 필요합니다.' });
    }
  const { user_id, title, content } = req.body;
  const userId = req.session.userId;
  const sql = 'INSERT INTO posts (user_id, title, content, created_at) VALUES (?, ?, ?, NOW())';
  pool.query(sql, [user_id, title, content], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId });
  });
});

// POST /api/comments
app.post('/api/comments', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }
  const { post_id, user_id, content } = req.body;
  const userId = req.session.userId; // ✅ 세션에서만 가져옴
  
  // ✅ [수정] created_at 컬럼에 NOW() 함수를 이용해 현재 시간을 명시적으로 추가합니다.
  const sql = 'INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, NOW())';
  
  pool.query(sql, [post_id, user_id, content], (err, result) => {
    if (err) {
      // ✅ 디버깅을 위해 서버 콘솔에 에러를 출력하는 것이 매우 중요합니다.
      console.error("댓글 등록 DB 오류:", err); 
      return res.status(500).json({ error: err.message });
    }
    // 성공 시, 새로 생성된 댓글의 id를 포함하여 응답
    res.status(201).json({ id: result.insertId }); 
  });
});

// GET /api/comments?post_id=1
app.get('/api/comments', (req, res) => {
  const { post_id } = req.query;
  pool.query('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC', [post_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


// 특정 영화의 리뷰 목록 조회 API
app.get('/api/reviews', (req, res) => {
    const { movie_title } = req.query;
    const sql = 'SELECT * FROM reviews WHERE movie_title = ? ORDER BY created_at DESC';
    pool.query(sql, [movie_title], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
});

// --- 게시글 검색 API ---
app.get('/api/search/posts', (req, res) => {
  const searchTerm = `%${req.query.q}%`; // URL 쿼리에서 검색어 가져오기 (예: ?q=검색어)
  const sql = 'SELECT * FROM posts WHERE title LIKE ? OR content LIKE ? ORDER BY id DESC';

  pool.query(sql, [searchTerm, searchTerm], (err, results) => {
    if (err) {
      console.error("게시글 검색 DB 오류:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});


// DELETE /api/comments/:id  <-- 댓글 삭제 API
app.delete('/api/comments/:id', (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }
  const commentId = req.params.id;
    // ✅ 먼저 작성자 확인
  pool.query('SELECT user_id FROM comments WHERE id = ?', [commentId], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'Not found' });
        
      // ✅ 본인이 작성한 댓글인지 확인
       if (results[0].user_id !== req.session.userId) {
          return res.status(403).json({ error: '삭제 권한이 없습니다.' });
      }
        
      // ✅ 본인 댓글이면 삭제
      pool.query('DELETE FROM comments WHERE id = ?', [commentId], (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true });
      });
   });
});