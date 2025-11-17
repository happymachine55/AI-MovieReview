// ========================================================
// 📦 필수 모듈 불러오기
// ========================================================
const path = require('path'); // 파일 경로 처리
// .env 파일을 현재 소스 파일 기준으로 명시해서 로드합니다.
// 이렇게 하면 부모 디렉터리에서 `node AI-MovieReview\app.js`로 실행해도 .env가 읽힙니다.
require('dotenv').config({ path: path.join(__dirname, '.env') }); // 환경 변수 로드 (.env 파일)
const express = require('express'); // 웹 서버 프레임워크
const fetch = require('node-fetch'); // HTTP 요청 (Gemini API 호출용)
const bcrypt = require('bcrypt'); // 비밀번호 암호화
const pool = require('./db.js'); // MySQL 데이터베이스 연결 풀
const multer = require('multer'); // 파일 업로드
const fs = require('fs');

// ========================================================
// 🚀 Express 앱 초기화 및 미들웨어 설정
// ========================================================
const app = express();
app.use(express.json()); // JSON 형식의 요청 본문 파싱

// ========================================================
// 🔐 세션 관리 설정 (로그인 상태 유지)
// ========================================================
const session = require('express-session');
app.use(session({
    secret: 'your-secret-key-change-this', // 세션 암호화 키 (보안상 변경 필요)
    resave: false, // 세션이 수정되지 않아도 다시 저장할지 여부
    saveUninitialized: false, // 초기화되지 않은 세션 저장 방지
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 쿠키 유효기간: 24시간
}));

// ========================================================
// 📁 정적 파일 제공 (HTML, CSS, JS)
// ========================================================
// frontend 폴더의 파일들을 웹에서 접근 가능하게 설정
app.use(express.static(path.join(__dirname, 'frontend')));

// 업로드 디렉터리 설정
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, 'profile-' + Date.now() + ext);
    }
});
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ========================================================
// 🔑 로그인 API (bcrypt 암호화 적용)
// ========================================================
// POST /api/login - 사용자 인증 및 세션 생성
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body; // 요청에서 아이디/비밀번호 추출
    
    try {
        // 데이터베이스에서 사용자 조회 (username만으로 조회)
        pool.query('SELECT * FROM users WHERE username = ?', 
            [username], 
            async (err, results) => {
                if (err) return res.status(500).json({ error: err.message });
                
                // 사용자가 없으면 401 에러 반환
                if (results.length === 0) {
                    return res.status(401).json({ error: '아이디 또는 비밀번호가 잘못되었습니다.' });
                }
                
                const user = results[0];
                
                // 비밀번호 검증 (bcrypt 사용)
                const isPasswordValid = await bcrypt.compare(password, user.password);
                
                if (!isPasswordValid) {
                    return res.status(401).json({ error: '아이디 또는 비밀번호가 잘못되었습니다.' });
                }
                
                // 로그인 성공 시 세션에 사용자 정보 저장
                req.session.userId = user.id; // 사용자 ID 저장
                req.session.username = user.username; // 사용자명 저장
                req.session.profileImage = user.profile_image || null; // 프로필 이미지 경로 저장
                
                res.json({ success: true, user: { id: user.id, username: user.username, profile_image: user.profile_image || null } });
            }
        );
    } catch (error) {
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// ========================================================
// 🚪 로그아웃 API
// ========================================================
// POST /api/logout - 세션 삭제 및 로그아웃
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => { // 세션 완전 삭제
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// ========================================================
// 📝 회원가입 API (bcrypt 암호화 적용)
// ========================================================
app.post('/api/register', upload.single('profile'), async (req, res) => {
    const { username, password } = req.body;
    
    // 입력 검증
    if (!username || !password) {
        return res.status(400).json({ error: '아이디와 비밀번호를 입력해주세요.' });
    }
    
    if (username.length < 3 || username.length > 20) {
        return res.status(400).json({ error: '아이디는 3~20자 사이여야 합니다.' });
    }
    
    if (password.length < 4) {
        return res.status(400).json({ error: '비밀번호는 최소 4자 이상이어야 합니다.' });
    }
    
    try {
        // 중복 체크
        pool.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            if (results.length > 0) {
                return res.status(409).json({ error: '이미 사용 중인 아이디입니다.' });
            }
            
            // 비밀번호 해시화 (bcrypt, saltRounds=10)
            const hashedPassword = await bcrypt.hash(password, 10);

            // 프로필 이미지 경로
            let profilePath = null;
            if (req.file) {
                profilePath = '/uploads/' + req.file.filename;
            }

            // 회원 등록 (profile_image 컬럼이 있어야 합니다)
            const sql = 'INSERT INTO users (username, password, profile_image, created_at) VALUES (?, ?, ?, NOW())';
            pool.query(sql, [username, hashedPassword, profilePath], (err, result) => {
                if (err) {
                    console.error('회원가입 DB 오류:', err);
                    return res.status(500).json({ error: err.message });
                }

                // 세션에 프로필 정보 저장
                req.session.userId = result.insertId;
                req.session.username = username;
                req.session.profileImage = profilePath;

                res.json({ 
                    success: true, 
                    message: '회원가입이 완료되었습니다.',
                    userId: result.insertId,
                    profileImage: profilePath
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});


// ========================================================
// 👤 현재 로그인 상태 확인 API
// ========================================================
// GET /api/me - 세션에 저장된 사용자 정보 반환
app.get('/api/me', (req, res) => {
    if (req.session.userId) { // 세션에 userId가 있으면 로그인 상태
        res.json({ loggedIn: true, 
            user: { 
                id: req.session.userId, 
                username: req.session.username,
                profile_image: req.session.profileImage || null
            } 
        });
    } else { // 세션에 userId가 없으면 로그아웃 상태
        res.json({ loggedIn: false });
    }
});

// ========================================================
// 📝 게시글 관련 API
// ========================================================

// GET /api/posts - 모든 게시글 조회 (최신순 정렬)
app.get('/api/posts', (req, res) => {
  const sql = `
      SELECT 
          posts.*, 
          users.username 
      FROM posts 
      LEFT JOIN users ON posts.user_id = users.id 
      ORDER BY posts.id DESC
  `;  
  pool.query(sql, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
  });
});

// GET /api/posts/:id - 특정 게시글 조회
app.get('/api/posts/:id', (req, res) => {
  pool.query('SELECT * FROM posts WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(results[0]);
  });
});

// DELETE /api/posts/:id - 게시글 삭제 (본인만 가능)
app.delete('/api/posts/:id', (req, res) => {
    // 로그인 체크
    if (!req.session.userId) {
        return res.status(401).json({ error: '로그인이 필요합니다.' });
    }
    
    const postId = req.params.id;
    
    // 먼저 게시글의 작성자 확인
    pool.query('SELECT user_id FROM posts WHERE id = ?', [postId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Not found' });
        
        // 본인이 작성한 글인지 확인 (세션의 userId와 비교)
        if (results[0].user_id !== req.session.userId) {
            return res.status(403).json({ error: '삭제 권한이 없습니다.' });
        }
        
        // 본인 글이면 삭제 실행
        pool.query('DELETE FROM posts WHERE id = ?', [postId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
});

// ========================================================
// 🎬 영화 리뷰 관련 API
// ========================================================

// POST /api/reviews - 영화 리뷰 저장 (로그인 필요)
app.post('/api/reviews', (req, res) => {
    // 로그인 체크
    if (!req.session.userId) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }
    
    const { movie_title, rating, content, recommend } = req.body;
    const userId = req.session.userId; // 세션에서 사용자 ID 가져오기 (보안)
    
    // PostgreSQL 호환: RETURNING id 추가
    const sql = 'INSERT INTO reviews (movie_title, user_id, rating, content, recommend, created_at) VALUES (?, ?, ?, ?, ?, NOW()) RETURNING id';
    pool.query(sql, [movie_title, userId, rating, content, recommend], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      // PostgreSQL: result[0].id, MySQL: result.insertId
      const insertId = result[0]?.id || result.insertId;
      res.json({ id: insertId }); // 생성된 리뷰 ID 반환
    });
  });
  
// DELETE /api/reviews/:id - 리뷰 삭제 (본인만 가능)
app.delete('/api/reviews/:id', (req, res) => {
    // 로그인 체크
    if (!req.session.userId) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }
    
    const reviewId = req.params.id;
    
    // 먼저 리뷰 작성자 확인
    pool.query('SELECT user_id FROM reviews WHERE id = ?', [reviewId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Not found' });
        
        // 본인이 작성한 리뷰인지 확인
        if (results[0].user_id !== req.session.userId) {
            return res.status(403).json({ error: '삭제 권한이 없습니다.' });
        }
        
        // 본인 리뷰면 삭제 실행
        pool.query('DELETE FROM reviews WHERE id = ?', [reviewId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
});

// ========================================================
// 🤖 AI 리뷰 생성 API (Gemini API 사용)
// ========================================================
// POST /api/ai-review - 사용자 선택 키워드로 AI 리뷰 3개 생성
app.post('/api/ai-review', async (req, res) => {
  const { movieTitle, emotions, recommend, score } = req.body;

  // Gemini API에 보낼 프롬프트 생성 함수
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
      `- 각 관람평은 영화제목, 감정, 추천, 평점이 자연스럽게 포함되어야 하며, 공백 제외 200바이트 내외로 아주 짧게 작성.\n` +
      `- 감정형용사, 부사, 생생한 묘사를 활용해 주세요.\n` +
      `- 출력은 1, 2, 3 순서로 관람평만 출력하세요. 키워드에 별표나 강조 기호를 붙이지 마세요.\n`
    );
  }

  const prompt = makePrompt({ title: movieTitle, emotions, recommend, score });
  const apiKey = process.env.GEMINI_API_KEY; // .env 파일에서 API 키 로드
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API 키가 .env 파일에 설정되지 않았습니다.' });
  }

  try {
    // Gemini API 호출
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const geminiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 1500, // 생성할 최대 토큰 수
          temperature: 1.2 // 창의성 조절 (높을수록 창의적)
        }
      })
    });
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
  const { title, content } = req.body;
  const userId = req.session.userId; // ✅ 세션에서 가져옴
  // PostgreSQL 호환: RETURNING id 추가
  const sql = 'INSERT INTO posts (user_id, title, content, created_at) VALUES (?, ?, ?, NOW()) RETURNING id';
  pool.query(sql, [userId, title, content], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    // PostgreSQL: result[0].id, MySQL: result.insertId
    const insertId = result[0]?.id || result.insertId;
    res.json({ id: insertId });
  });
});

// POST /api/comments
app.post('/api/comments', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }
  const { post_id, content } = req.body; // ✅ user_id는 받지 않음
  const userId = req.session.userId; // ✅ 세션에서만 가져옴
  
  // ✅ [수정] created_at 컬럼에 NOW() 함수를 이용해 현재 시간을 명시적으로 추가합니다.
  // PostgreSQL 호환: RETURNING id 추가
  const sql = 'INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, NOW()) RETURNING id';
  
  pool.query(sql, [post_id, userId, content], (err, result) => { // ✅ userId로 통일
    if (err) {
      // ✅ 디버깅을 위해 서버 콘솔에 에러를 출력하는 것이 매우 중요합니다.
      console.error("댓글 등록 DB 오류:", err); 
      return res.status(500).json({ error: err.message });
    }
    // 성공 시, 새로 생성된 댓글의 id를 포함하여 응답
    // PostgreSQL: result[0].id, MySQL: result.insertId
    const insertId = result[0]?.id || result.insertId;
    res.status(201).json({ id: insertId }); 
  });
});

// GET /api/comments?post_id=1
app.get('/api/comments', (req, res) => {
  const post_id = req.query.post_id; // ✅ 수정
  const sql = `
    SELECT comments.*, users.username 
      FROM comments 
      LEFT JOIN users ON comments.user_id = users.id
      WHERE comments.post_id = ?
      ORDER BY comments.created_at ASC
  `;
  pool.query(sql, [post_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


// 특정 영화의 리뷰 목록 조회 API
app.get('/api/reviews', (req, res) => {
    const movie_title = req.query.movie_title; // ✅ 수정
    const sql = `
      SELECT 
        reviews.*, 
        users.username 
      FROM reviews 
      LEFT JOIN users ON reviews.user_id = users.id 
      WHERE reviews.movie_title = ? 
      ORDER BY reviews.created_at DESC
    `;
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

// ========================================================
// 🚀 서버 시작 (Railway 배포를 위한 동적 PORT 설정)
// ========================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
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

// ========================================================
// 👍👎 리뷰 좋아요/싫어요 API
// ========================================================

// POST /api/reviews/:id/like - 리뷰 좋아요/싫어요 토글
app.post('/api/reviews/:id/like', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    const reviewId = req.params.id;
    const userId = req.session.userId;
    const { like_type } = req.body; // 'like' 또는 'dislike' (언더스코어로 변경)

    if (!['like', 'dislike'].includes(like_type)) {
        return res.status(400).json({ error: '잘못된 요청입니다.' });
    }

    // 기존 좋아요/싫어요 확인
    pool.query('SELECT * FROM review_likes WHERE review_id = ? AND user_id = ?', 
        [reviewId, userId], 
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });

            if (results.length > 0) {
                const existingLike = results[0];

                // 같은 타입이면 취소 (삭제)
                if (existingLike.like_type === like_type) {
                    pool.query('DELETE FROM review_likes WHERE id = ?', [existingLike.id], (err) => {
                        if (err) return res.status(500).json({ error: err.message });
                        
                        // 카운트 감소
                        const column = like_type === 'like' ? 'likes_count' : 'dislikes_count';
                        pool.query(`UPDATE reviews SET ${column} = ${column} - 1 WHERE id = ?`, [reviewId], (err) => {
                            if (err) return res.status(500).json({ error: err.message });
                            
                            // 최신 카운트 조회
                            pool.query('SELECT likes_count, dislikes_count FROM reviews WHERE id = ?', [reviewId], (err, rows) => {
                                if (err) return res.status(500).json({ error: err.message });
                                res.json({ 
                                    success: true, 
                                    action: 'removed',
                                    likes_count: rows[0].likes_count,
                                    dislikes_count: rows[0].dislikes_count
                                });
                            });
                        });
                    });
                } else {
                    // 다른 타입이면 변경 (like ↔ dislike)
                    pool.query('UPDATE review_likes SET like_type = ? WHERE id = ?', 
                        [like_type, existingLike.id], 
                        (err) => {
                            if (err) return res.status(500).json({ error: err.message });

                            // 기존 카운트 감소, 새 카운트 증가
                            const oldColumn = existingLike.like_type === 'like' ? 'likes_count' : 'dislikes_count';
                            const newColumn = like_type === 'like' ? 'likes_count' : 'dislikes_count';
                            
                            pool.query(
                                `UPDATE reviews SET ${oldColumn} = ${oldColumn} - 1, ${newColumn} = ${newColumn} + 1 WHERE id = ?`, 
                                [reviewId], 
                                (err) => {
                                    if (err) return res.status(500).json({ error: err.message });
                                    
                                    // 최신 카운트 조회
                                    pool.query('SELECT likes_count, dislikes_count FROM reviews WHERE id = ?', [reviewId], (err, rows) => {
                                        if (err) return res.status(500).json({ error: err.message });
                                        res.json({ 
                                            success: true, 
                                            action: 'changed',
                                            likes_count: rows[0].likes_count,
                                            dislikes_count: rows[0].dislikes_count
                                        });
                                    });
                                }
                            );
                        }
                    );
                }
            } else {
                // 새로 추가
                pool.query('INSERT INTO review_likes (review_id, user_id, like_type) VALUES (?, ?, ?)', 
                    [reviewId, userId, like_type], 
                    (err) => {
                        if (err) return res.status(500).json({ error: err.message });

                        // 카운트 증가
                        const column = like_type === 'like' ? 'likes_count' : 'dislikes_count';
                        pool.query(`UPDATE reviews SET ${column} = ${column} + 1 WHERE id = ?`, [reviewId], (err) => {
                            if (err) return res.status(500).json({ error: err.message });
                            
                            // 최신 카운트 조회
                            pool.query('SELECT likes_count, dislikes_count FROM reviews WHERE id = ?', [reviewId], (err, rows) => {
                                if (err) return res.status(500).json({ error: err.message });
                                res.json({ 
                                    success: true, 
                                    action: 'added',
                                    likes_count: rows[0].likes_count,
                                    dislikes_count: rows[0].dislikes_count
                                });
                            });
                        });
                    }
                );
            }
        }
    );
});

// GET /api/reviews/:id/like-status - 현재 사용자의 좋아요/싫어요 상태 조회
app.get('/api/reviews/:id/like-status', (req, res) => {
    if (!req.session.userId) {
        return res.json({ likeStatus: null });
    }

    const reviewId = req.params.id;
    const userId = req.session.userId;

    pool.query('SELECT like_type FROM review_likes WHERE review_id = ? AND user_id = ?', 
        [reviewId, userId], 
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            
            if (results.length > 0) {
                res.json({ likeStatus: results[0].like_type });
            } else {
                res.json({ likeStatus: null });
            }
        }
    );
});

// ========================================================
// 👍👎 게시글 좋아요/싫어요 API
// ========================================================

// ========================================================
// 📝 사용자 피드백 API
// ========================================================
// POST /api/feedback - 사용자 피드백 제출 (로그인 필요)
app.post('/api/feedback', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: '로그인이 필요합니다.' });
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: '내용을 입력해주세요.' });

    const sql = 'INSERT INTO feedbacks (user_id, content, created_at) VALUES (?, ?, NOW())';
    pool.query(sql, [req.session.userId, content], (err, result) => {
        if (err) {
            console.error('피드백 DB 오류:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: result.insertId });
    });
});

// GET /api/feedback - 현재 사용자가 제출한 피드백 목록 조회
app.get('/api/feedback', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: '로그인이 필요합니다.' });
    const sql = `SELECT feedbacks.*, users.username FROM feedbacks LEFT JOIN users ON feedbacks.user_id = users.id WHERE feedbacks.user_id = ? ORDER BY feedbacks.created_at DESC`;
    pool.query(sql, [req.session.userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST /api/posts/:id/like - 게시글 좋아요/싫어요 토글
app.post('/api/posts/:id/like', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    const postId = req.params.id;
    const userId = req.session.userId;
    const { like_type } = req.body; // 'like' 또는 'dislike' (언더스코어로 변경)

    if (!['like', 'dislike'].includes(like_type)) {
        return res.status(400).json({ error: '잘못된 요청입니다.' });
    }

    // 기존 좋아요/싫어요 확인
    pool.query('SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?', 
        [postId, userId], 
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });

            if (results.length > 0) {
                const existingLike = results[0];

                // 같은 타입이면 취소 (삭제)
                if (existingLike.like_type === like_type) {
                    pool.query('DELETE FROM post_likes WHERE id = ?', [existingLike.id], (err) => {
                        if (err) return res.status(500).json({ error: err.message });
                        
                        // 카운트 감소
                        const column = like_type === 'like' ? 'likes_count' : 'dislikes_count';
                        pool.query(`UPDATE posts SET ${column} = ${column} - 1 WHERE id = ?`, [postId], (err) => {
                            if (err) return res.status(500).json({ error: err.message });
                            
                            // 최신 카운트 조회
                            pool.query('SELECT likes_count, dislikes_count FROM posts WHERE id = ?', [postId], (err, rows) => {
                                if (err) return res.status(500).json({ error: err.message });
                                res.json({ 
                                    success: true, 
                                    action: 'removed',
                                    likes_count: rows[0].likes_count,
                                    dislikes_count: rows[0].dislikes_count
                                });
                            });
                        });
                    });
                } else {
                    // 다른 타입이면 변경
                    pool.query('UPDATE post_likes SET like_type = ? WHERE id = ?', 
                        [like_type, existingLike.id], 
                        (err) => {
                            if (err) return res.status(500).json({ error: err.message });

                            // 기존 카운트 감소, 새 카운트 증가
                            const oldColumn = existingLike.like_type === 'like' ? 'likes_count' : 'dislikes_count';
                            const newColumn = like_type === 'like' ? 'likes_count' : 'dislikes_count';
                            
                            pool.query(
                                `UPDATE posts SET ${oldColumn} = ${oldColumn} - 1, ${newColumn} = ${newColumn} + 1 WHERE id = ?`, 
                                [postId], 
                                (err) => {
                                    if (err) return res.status(500).json({ error: err.message });
                                    
                                    // 최신 카운트 조회
                                    pool.query('SELECT likes_count, dislikes_count FROM posts WHERE id = ?', [postId], (err, rows) => {
                                        if (err) return res.status(500).json({ error: err.message });
                                        res.json({ 
                                            success: true, 
                                            action: 'changed',
                                            likes_count: rows[0].likes_count,
                                            dislikes_count: rows[0].dislikes_count
                                        });
                                    });
                                }
                            );
                        }
                    );
                }
            } else {
                // 새로 추가
                pool.query('INSERT INTO post_likes (post_id, user_id, like_type) VALUES (?, ?, ?)', 
                    [postId, userId, like_type], 
                    (err) => {
                        if (err) return res.status(500).json({ error: err.message });

                        // 카운트 증가
                        const column = like_type === 'like' ? 'likes_count' : 'dislikes_count';
                        pool.query(`UPDATE posts SET ${column} = ${column} + 1 WHERE id = ?`, [postId], (err) => {
                            if (err) return res.status(500).json({ error: err.message });
                            
                            // 최신 카운트 조회
                            pool.query('SELECT likes_count, dislikes_count FROM posts WHERE id = ?', [postId], (err, rows) => {
                                if (err) return res.status(500).json({ error: err.message });
                                res.json({ 
                                    success: true, 
                                    action: 'added',
                                    likes_count: rows[0].likes_count,
                                    dislikes_count: rows[0].dislikes_count
                                });
                            });
                        });
                    }
                );
            }
        }
    );
});

// GET /api/posts/:id/like-status - 현재 사용자의 좋아요/싫어요 상태 조회
app.get('/api/posts/:id/like-status', (req, res) => {
    if (!req.session.userId) {
        return res.json({ likeStatus: null });
    }

    const postId = req.params.id;
    const userId = req.session.userId;

    pool.query('SELECT like_type FROM post_likes WHERE post_id = ? AND user_id = ?', 
        [postId, userId], 
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            
            if (results.length > 0) {
                res.json({ likeStatus: results[0].like_type });
            } else {
                res.json({ likeStatus: null });
            }
        }
    );
});