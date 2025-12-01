// ========================================================
// 📌 전역 변수 선언
// ========================================================
window.currentMovieTitle = null; // 현재 선택된 영화 제목

// AI 리뷰 생성용 감정 키워드 목록 (30개)
const EMOTION_KEYWORDS = [
    "행복", "슬픔", "분노", "즐거움", "긴장됨", "우울", "무서움", "감동", "경이로움", "아쉬움",
    "희망", "실망", "설렘", "놀라움", "두려움", "그리움", "외로움", "평온함", "짜증", "뿌듯함",
    "피곤함", "지루함", "충격", "혼란", "불안", "만족", "자유로움", "고마움", "원망", "기대"
];

// 추천 옵션 목록 (3가지)
const RECOMMEND_OPTIONS = ["추천함", "추천하지 않음", "다시 보고 싶음"];

// AI 리뷰 생성 시 사용자가 선택한 값 저장 변수
let lastSelectedRecommend = null; // 선택한 추천 여부
let lastSelectedScore = null; // 선택한 평점 (1~10점)

// ========================================================
// � 로그인 상태 확인 및 UI 업데이트
// ========================================================
// 로컬 세션에서 로그인 상태를 확인하고 화면에 반영
function updateLoginStatus() {
    const userId = Session.getUserId();
    const username = Session.getUsername();
    
    if (userId && username) {
        // 로그인 상태: 사용자 이름 표시, 로그아웃 버튼 표시
        document.getElementById('username-display').textContent = username + ' 님';
        
        // 프로필 이미지 표시
        const profileImage = localStorage.getItem('profile_image');
        if (profileImage && typeof displayProfileImage === 'function') {
            displayProfileImage(profileImage);
        }
        
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('register-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'inline';
        window.currentUserId = parseInt(userId);
        window.currentUsername = username;
    } else {
        // 로그아웃 상태: 로그인 버튼 표시
        document.getElementById('username-display').textContent = '';
        document.getElementById('profile-img').style.display = 'none';
        document.getElementById('login-btn').style.display = 'inline';
        document.getElementById('register-btn').style.display = 'inline';
        document.getElementById('logout-btn').style.display = 'none';
        window.currentUserId = null;
        window.currentUsername = null;
    }
}

// ========================================================
// 🔑 로그인 함수
// ========================================================
// 사용자로부터 아이디/비밀번호를 입력받아 로그인 시도
async function login() {
    const username = prompt('아이디를 입력하세요:');
    const password = prompt('비밀번호를 입력하세요:');

    if (!username || !password) {
        alert('아이디와 비밀번호를 모두 입력하세요.');
        return;
    }

    try {
        // Supabase에서 사용자 조회
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username);

        if (error || !users || users.length === 0) {
            alert('아이디 또는 비밀번호가 잘못되었습니다.');
            return;
        }

        const user = users[0];
        
        // 비밀번호 해시 검증 (SHA-256)
        const encoder = new TextEncoder();
        const data = encoder.encode(password + username);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        if (user.password !== hashedPassword) {
            alert('아이디 또는 비밀번호가 잘못되었습니다.');
            return;
        }

        // 로컬 세션에 사용자 정보 저장
        Session.setUser(user.id, user.username);
        if (user.profile_image) {
            localStorage.setItem('profile_image', user.profile_image);
        }
        alert('로그인 성공!');
        updateLoginStatus();
        
        // ✅ 로그인 후 현재 페이지 새로고침
        if (window.currentPage === 'post-detail' && window.location.search.includes('postId=')) {
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get('postId');
            if (postId) loadPostComments(postId);
        } else if (window.currentPage === 'movie-detail' && window.location.search.includes('movieId=')) {
            const urlParams = new URLSearchParams(window.location.search);
            const movieId = urlParams.get('movieId');
            if (movieId) {
                const movie = movieData.movies.find(m => m.id == movieId);
                if (movie) loadComments(movie.title, movie);
            }
        } else if (window.currentPage === 'gallery') {
            loadBoardData();
        }
    } catch (err) {
        console.error('로그인 오류:', err);
        alert(err.message || '로그인 중 오류가 발생했습니다.');
    }
}

// 📌 회원가입 함수
function register() {
    // 동적 모달 형태의 가입 폼 생성 (프로필 이미지 업로드 포함)
    if (document.getElementById('registerModal')) return; // 이미 열려있으면 무시

    const modal = document.createElement('div');
    modal.id = 'registerModal';
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.background = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';

    modal.innerHTML = `
        <div class="register-modal-content">
            <h3 style="margin-top:0;margin-bottom:24px;color:#333;font-size:24px;text-align:center;">회원가입</h3>
            <div class="form-group">
                <input id="reg-username" type="text" placeholder="아이디" class="register-input">
            </div>
            <div class="form-group">
                <input id="reg-password" type="password" placeholder="비밀번호" class="register-input">
            </div>
            <div class="form-group">
                <input id="reg-password-confirm" type="password" placeholder="비밀번호 확인" class="register-input">
            </div>
            <div class="form-group">
                <label style="display:block;margin-bottom:8px;color:#555;font-size:14px;">프로필 이미지 (선택)</label>
                <input id="reg-profile" type="file" accept="image/*" class="register-file-input">
            </div>
            <div class="register-button-group">
                <button id="reg-cancel" class="register-btn register-btn-cancel">취소</button>
                <button id="reg-submit" class="register-btn register-btn-submit">가입</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('reg-cancel').addEventListener('click', () => {
        modal.remove();
    });

    document.getElementById('reg-submit').addEventListener('click', async () => {
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const passwordConfirm = document.getElementById('reg-password-confirm').value;
        const profileFile = document.getElementById('reg-profile').files[0];

        if (!username || !password || !passwordConfirm) {
            alert('모든 정보를 입력해주세요.');
            return;
        }
        if (password !== passwordConfirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            // 1️⃣ 중복 아이디 체크
            const { data: existingUsers, error: checkError } = await supabase
                .from('users')
                .select('id')
                .eq('username', username);
            
            if (checkError) {
                throw new Error('아이디 확인 실패: ' + checkError.message);
            }
            
            if (existingUsers && existingUsers.length > 0) {
                alert('이미 존재하는 아이디입니다.');
                return;
            }

            // 2️⃣ 간단한 비밀번호 해시 (SHA-256)
            const encoder = new TextEncoder();
            const data = encoder.encode(password + username); // salt로 username 사용
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            // 3️⃣ Supabase에 먼저 사용자 생성 (프로필 이미지 없이)
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert([{
                    username: username,
                    password: hashedPassword,
                    profile_image: null
                }])
                .select()
                .single();

            if (insertError) {
                throw new Error('회원가입 실패: ' + insertError.message);
            }

            // 4️⃣ 프로필 이미지 업로드 (userId와 함께)
            let profileImageData = null;
            if (profileFile && typeof uploadProfileImage === 'function') {
                const uploadedUrl = await uploadProfileImage(profileFile, newUser.id);
                if (uploadedUrl) {
                    profileImageData = uploadedUrl;
                    
                    // DB 업데이트
                    await supabase
                        .from('users')
                        .update({ profile_image: uploadedUrl })
                        .eq('id', newUser.id);
                    
                    localStorage.setItem('profile_image', uploadedUrl);
                }
            }

            // 5️⃣ 회원가입 성공 후 세션 저장
            Session.setUser(newUser.id, username);
            if (profileImageData) {
                localStorage.setItem('profile_image', profileImageData);
            }
            
            alert('회원가입 성공! 자동으로 로그인 되었습니다.');
            modal.remove();
            updateLoginStatus();
            
        } catch (err) {
            console.error('회원가입 오류:', err);
            alert('회원가입 오류: ' + err.message);
        }
    });
}


// ========================================================
// 🚪 로그아웃 함수
// ========================================================
// 로컬 세션을 삭제하고 UI를 업데이트
function logout() {
    Session.clear();
    alert('로그아웃 되었습니다.');
    updateLoginStatus();

    // ✅ 로그아웃 후 현재 페이지 새로고침
    if (window.currentPage === 'post-detail' && window.location.search.includes('postId=')) {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('postId');
        if (postId) loadPostComments(postId);
    } else if (window.currentPage === 'movie-detail' && window.location.search.includes('movieId=')) {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('movieId');
        if (movieId) {
            const movie = movieData.movies.find(m => m.id == movieId);
            if (movie) loadComments(movie.title, movie);
        }
    } else if (window.currentPage === 'gallery') {
        loadBoardData();
    }
}

// ========================================================
// �🚀 DOM 로드 완료 시 실행 (페이지 초기화)
// ========================================================
document.addEventListener('DOMContentLoaded', function () {
    // 앱 초기 설정 (URL 파라미터 확인, 히스토리 설정)
    initializeApp();

    // 이벤트 리스너 설정 (네비게이션, 버튼 클릭 등)
    setupEventListeners();
    
    // 로그인 상태 확인 및 UI 업데이트
    updateLoginStatus();

    // 영화 데이터 로드 (movies.js에서 불러옴)
    loadMovies();

    // URL에 page=gallery가 있으면 게시판 데이터 로드
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('page') === 'gallery' || window.currentPage === 'gallery') {
        loadBoardData();
    }
});

// ========================================================
// 📱 앱 초기화 함수
// ========================================================
// URL 파라미터를 확인하고 해당 페이지로 이동
function initializeApp() {
    window.currentPage = 'movies'; // 기본 페이지 설정
    
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    const movieId = urlParams.get('movieId');
    const postId = urlParams.get('postId');

    if (movieId) {
        // URL에서 직접 접근 시 히스토리 상태 설정
        window.history.replaceState({ page: 'movie-detail', movieId }, '', `/?movieId=${movieId}`);
        showMovieDetail(movieId);
    } else if (postId) {
        window.history.replaceState({ page: 'post-detail', postId }, '', `/?postId=${postId}`);
        showPostDetail(postId, true); // ✅ skipHistory = true (중복 방지)
    } else if (page === 'gallery') {
        window.history.replaceState({ page: 'gallery' }, '', '/?page=gallery');
        switchPage('gallery');
        // ⭐ 탭 버튼 활성화 업데이트 추가
        updateNavButtons("gallery");
    } else if (page) {
        window.history.replaceState({ page }, '', `/?page=${page}`);
        switchPage(page);
        // ⭐ 탭 버튼 활성화 업데이트 추가
        updateNavButtons(page);
    } else {
        window.history.replaceState({ page: 'movies' }, '', '/');
        // ⭐ 기본 페이지일 때도 탭 버튼 업데이트
        updateNavButtons("movies");
    }
}

// 네비게이션 버튼 활성화 상태 업데이트
function updateNavButtons(pageId) {
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 네비게이션 메뉴 클릭
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            // 활성 링크 업데이트
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // 페이지 전환
            const pageId = this.getAttribute('data-page');
            switchPage(pageId);

            // 글로벌 상태 업데이트
            window.currentPage = pageId;
        });
    });

    // 새 게시글 작성 완료 메시지 수신
    window.addEventListener('message', function(event) {
        if (event.data.type === 'POST_CREATED') {
            // 갤러리 페이지가 활성화되어 있으면 데이터 새로고침
            if (window.currentPage === 'gallery') {
                loadBoardData();
            }
        }
    });

    // 새 게시글 작성 완료 시 자동 새로고침
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'POST_CREATED') {
            // 갤러리 페이지가 활성화되어 있으면 데이터 새로고침
            if (window.currentPage === 'gallery') {
                loadBoardData();
            }
        }
    });

    // ✅ 여기에 추가: 브라우저 뒤로가기/앞으로가기 처리
    window.addEventListener('popstate', function(event) {
        console.log('🔙 popstate 이벤트:', event.state);

        // 우선 state에서 페이지 확인
        let pageId = event.state && event.state.page ? event.state.page : null;

        // state가 없으면 URL에서 page 파라미터를 파싱 (예: 직접 주소 입력 또는 외부 링크)
        if (!pageId) {
            const urlParams = new URLSearchParams(window.location.search);
            pageId = urlParams.get('page') || (urlParams.get('movieId') ? 'movie-detail' : 'movies');
        }

        // 페이지 전환 (히스토리 추가 없이 현재 상태 반영)
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(pageId);
        if (targetPage) targetPage.classList.add('active');
        window.currentPage = pageId;

        // 네비게이션 메뉴 활성화 상태 업데이트
        const navLinks = document.querySelectorAll('.main-nav a');
        navLinks.forEach(link => {
            if (link.getAttribute('data-page') === pageId) link.classList.add('active');
            else link.classList.remove('active');
        });

        // 상세 페이지 파라미터 처리
        if (pageId === 'movie-detail') {
            const movieId = (event.state && event.state.movieId) || new URLSearchParams(window.location.search).get('movieId');
            if (movieId) showMovieDetail(movieId);
        } else if (pageId === 'post-detail') {
            const postId = (event.state && event.state.postId) || new URLSearchParams(window.location.search).get('postId');
            if (postId) showPostDetail(postId, true);
        } else if (pageId === 'gallery') {
            loadBoardData();
        }
    });

    document.getElementById('write-button').addEventListener('click', () => {
        // ✅ 로그인 체크
        if (!window.currentUserId) {
            alert('로그인이 필요합니다.');
            return;
        }
        // ✅ 같은 페이지에서 글쓰기 페이지로 전환
        switchPage('write-post');
    });

    // ✅ 글쓰기 취소 버튼
    document.getElementById('write-cancel-btn').addEventListener('click', () => {
        switchPage('gallery');
        document.getElementById('write-title').value = '';
        document.getElementById('write-content').value = '';
    });

    // ✅ 글쓰기 등록 버튼
    document.getElementById('write-submit-btn').addEventListener('click', async () => {
        const title = document.getElementById('write-title').value.trim();
        const content = document.getElementById('write-content').value.trim();

        if (!title || !content) {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }

        if (!window.currentUserId) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            // Supabase 클라이언트로 직접 insert
            const { data, error } = await supabase
                .from('posts')
                .insert({
                    user_id: parseInt(window.currentUserId),
                    title: title,
                    content: content
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            alert("게시글이 등록되었습니다!");
            // ✅ 폼 초기화
            document.getElementById('write-title').value = '';
            document.getElementById('write-content').value = '';
            // ✅ 갤러리로 이동 & 자동 새로고침
            switchPage('gallery');
            loadBoardData(); // 게시글 목록 새로고침
        } catch (err) {
            console.error('게시글 작성 오류:', err);
            alert("게시글 등록 실패: " + err.message);
        }
    });

    // 뒤로가기 버튼 클릭: 브라우저 히스토리로 이동
    document.getElementById('backButton').addEventListener('click', function () {
        window.history.back();
    });

    document.getElementById('backToGallery').addEventListener('click', function () {
        switchPage('gallery');
    });

    // 검색 버튼 클릭
    document.getElementById('searchBtn').addEventListener('click', function () {
        performSearch();
    });

    // 엔터키로 검색
    document.getElementById('searchInput').addEventListener('keyup', function (e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // 리뷰 작성 버튼 클릭 이벤트 추가
    document.getElementById('commentWriteButton').addEventListener('click', () => {
        const commentForm = document.getElementById('commentForm');
        commentForm.style.display = 'block'; // 리뷰 작성 폼 표시
        document.getElementById('commentWriteButton').style.display = 'none'; // 버튼 숨기기
        renderStarRating(5); // ✅ 기본 5점으로 초기화
    });

    // [2] setupEventListeners() 함수 내에 추가 AI 리뷰 생성성
    document.getElementById('aiReviewBtn').onclick = function () {
        document.getElementById('aiReviewModal').classList.add('show');
        renderEmotionButtons();
        renderScoreButtons();
        renderRecommendButtons();
        document.getElementById('aiReviewResult').innerHTML = '';
        document.getElementById('applyAIReview').style.display = 'none';
        // ✅ 모달 열 때 이전 선택 초기화
        lastSelectedScore = null;
        lastSelectedRecommend = null;
    };
    document.querySelector('.close-modal').onclick = function () {
        document.getElementById('aiReviewModal').classList.remove('show');
        // ✅ 모달 닫을 때도 초기화
        lastSelectedScore = null;
        lastSelectedRecommend = null;
    };

    // [4] setupEventListeners() 함수 내에 추가 AI 리뷰 생성성
    document.getElementById('generateAIReview').onclick = async function () {
        // 입력값 수집
        const movieTitleInput = document.getElementById('aiMovieTitleInput').value.trim();
        const movieTitle = movieTitleInput || window.currentMovieTitle;
        const emotions = Array.from(document.querySelectorAll('.emotion-btn.selected')).map(b => b.textContent);
        const scoreBtn = document.querySelector('.score-btn.selected');
        const recommendBtn = document.querySelector('.recommend-btn.selected');
        const score = scoreBtn ? scoreBtn.textContent : null;
        const recommend = recommendBtn ? recommendBtn.textContent : null;
        
        // ✅ 선택한 값 저장 (리뷰 적용 시 사용)
        lastSelectedScore = score ? parseInt(score, 10) : null;
        lastSelectedRecommend = recommend;
        
        console.log('AI 생성 시 선택한 평점:', lastSelectedScore); // 디버깅
        console.log('AI 생성 시 선택한 추천:', lastSelectedRecommend); // 디버깅

        if (!movieTitle) return alert('영화 제목을 입력하세요.');
        if (emotions.length === 0) return alert('감정 키워드를 1개 이상 선택하세요.');
        if (!score) return alert('평점을 선택하세요.');
        if (!recommend) return alert('추천 여부를 선택하세요.');

        document.getElementById('aiReviewResult').innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> AI 관람평 생성 중...</div>';
        document.getElementById('applyAIReview').style.display = 'none';

        try {
            // Gemini API 직접 호출 (Edge Function 대신)
            const GEMINI_API_KEY = 'AIzaSyC0vNEDRhj8vQ6lNfB-iW1D6YIZy36oFNE';
            const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
            
            // 프롬프트 생성 - 3가지 다른 스타일의 리뷰 요청
            const prompt = `영화 "${movieTitle}"에 대한 리뷰를 3가지 다른 스타일로 작성해주세요.

사용자가 선택한 감정 키워드: ${emotions.join(', ')}
평점: ${score}/10
추천 여부: ${recommend}

각 리뷰는 다음 형식으로 작성해주세요:
1. 첫 번째 리뷰: 감정적이고 개인적인 스타일 (150-200자)
2. 두 번째 리뷰: 분석적이고 객관적인 스타일 (150-200자)
3. 세 번째 리뷰: 짧고 강렬한 한줄평 스타일 (50-100자)

응답은 반드시 다음 JSON 형식으로만 작성해주세요:
{
  "reviews": [
    {"style": "감정적", "content": "리뷰 내용"},
    {"style": "분석적", "content": "리뷰 내용"},
    {"style": "한줄평", "content": "리뷰 내용"}
  ]
}`;

            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (!response.ok) throw new Error('Gemini API 호출 실패');

            const data = await response.json();
            const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            // JSON 추출
            const jsonMatch = aiText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('AI 응답 파싱 실패');
            
            const parsed = JSON.parse(jsonMatch[0]);
            const reviews = parsed.reviews || [];
            
            if (reviews.length === 0) throw new Error('리뷰 생성 실패');
            
            // AI 리뷰 결과 표시 (3가지 선택지)
            const html = `
                <div class="ai-review-options">
                    <h4>🎬 생성된 관람평 (하나를 선택하세요)</h4>
                    ${reviews.map((review, index) => `
                        <div class="ai-review-box">
                            <input type="radio" name="aiReviewRadio" id="review${index}" value="${index}">
                            <label for="review${index}">
                                <strong>[${review.style}]</strong>
                                <p>${review.content}</p>
                            </label>
                        </div>
                    `).join('')}
                    <p style="margin-top:10px;color:#666;"><strong>평점: ${score}/10 | ${recommend}</strong></p>
                </div>
            `;
            document.getElementById('aiReviewResult').innerHTML = html;
            document.getElementById('applyAIReview').style.display = 'inline-block';
            
            // AI 리뷰를 전역 변수에 저장
            window.generatedAIReviews = reviews;
            window.generatedRating = parseInt(score, 10);
        } catch (e) {
            console.error('AI 리뷰 생성 오류:', e);
            document.getElementById('aiReviewResult').innerHTML = `<p style="color:red;">AI 리뷰 생성 실패: ${e.message}</p>`;
        }
    };

    // [5] setupEventListeners() 함수 내에 추가 AI 리뷰 생성성
    // 리뷰 적용 버튼 클릭 시
    // document.getElementById('applyAIReview').onclick = function () {
    //     const checkedRadio = document.querySelector('input[name="aiReviewRadio"]:checked');
    //     if (!checkedRadio) {
    //         alert('관람평을 선택하세요.');
    //         return;
    //     }
    //     const idx = parseInt(checkedRadio.value, 10);
    //     const reviewDivs = document.querySelectorAll('.review-content');
    //     const reviewText = reviewDivs[idx].innerText;

    //     // 평점과 추천여부 추출 (예: "추천합니다! 평점: 4점")
    //     let rating = 5; // 기본값
    //     let recommend = "추천함"; // 기본값
    //     const ratingMatch = reviewText.match(/평점[:：]?\s*([0-9]{1,2})점/);
    //     if (ratingMatch) rating = parseInt(ratingMatch[1], 10);
    //     if (reviewText.includes("추천하지 않음")) recommend = "추천하지 않음";
    //     else if (reviewText.includes("다시 보고 싶음")) recommend = "다시 보고 싶음";
    //     else if (reviewText.includes("추천")) recommend = "추천함";

    //     // 리뷰 입력란에 텍스트 반영
    //     document.getElementById('commentText').value = reviewText;

    //     // 별점 UI 반영 (별점 렌더 함수가 있다면 사용)
    //     renderStarRating(rating);

    //     // 추천여부 라디오/버튼 반영
    //     const recommendInputs = document.querySelectorAll('input[name="recommend"]');
    //     recommendInputs.forEach(input => {
    //         input.checked = (input.value === recommend);
    //     });

    //     document.getElementById('aiReviewModal').classList.remove('show');
    // };
    document.getElementById('applyAIReview').onclick = function () {
        const checkedRadio = document.querySelector('input[name="aiReviewRadio"]:checked');
        if (!checkedRadio) {
            alert('관람평을 선택하세요.');
            return;
        }
        
        const idx = parseInt(checkedRadio.value, 10);
        
        // ✅ 저장된 AI 리뷰 배열에서 선택한 리뷰 가져오기
        if (!window.generatedAIReviews || !window.generatedAIReviews[idx]) {
            alert('리뷰를 찾을 수 없습니다.');
            return;
        }
        
        const selectedReview = window.generatedAIReviews[idx];
        const reviewText = selectedReview.content;
    
        // ✅ 사용자가 AI 생성 모달에서 선택한 평점 사용
        let rating = lastSelectedScore || window.generatedRating || 5;
        
        console.log('AI 리뷰 적용 - 선택한 리뷰:', selectedReview);
        console.log('AI 리뷰 적용 - 저장된 평점:', rating);
        console.log('AI 리뷰 적용 - 저장된 추천:', lastSelectedRecommend);
    
        // ✅ 사용자가 AI 생성 모달에서 선택한 추천여부 사용
        let recommend = lastSelectedRecommend || "추천함";
    
        // 리뷰 입력란에 텍스트 반영
        document.getElementById('commentText').value = reviewText;
    
        // 별점 UI 반영
        renderStarRating(rating);
    
        // 추천여부 라디오/버튼 반영
        const recommendInputs = document.querySelectorAll('input[name="recommend"]');
        recommendInputs.forEach(input => {
            input.checked = (input.value.trim() === recommend);
        });

        document.querySelectorAll('.recommend-btn').forEach(btn => {
            if (btn.textContent.trim() === recommend) btn.classList.add('selected');
            else btn.classList.remove('selected');
        });
    
        document.getElementById('aiReviewModal').classList.remove('show');
    };
    
    


    // 등록 버튼 이벤트: recommend 꼭 전달
    document.getElementById('submitComment').addEventListener('click', () => {
        const commentText = document.getElementById('commentText').value.trim();
        if (commentText === '') { alert('리뷰 내용을 입력해주세요.'); return; }
        
        // ✅ 로그인하지 않은 경우 작성 불가
        if (!window.currentUserId) {
            alert('로그인이 필요합니다.');
            return;
        }
        
        // ✅ 별점 가져오기 (선택 안하면 경고)
        const rating = Number(document.getElementById('starRating').dataset.selected);
        if (!rating || rating < 1 || rating > 10) {
            alert('평점을 선택해주세요 (1~10점)');
            return;
        }
        
        console.log('선택한 평점:', rating); // 디버깅용
        
        // 추천여부 값 가져오기
        const recommend = document.querySelector('input[name="recommend"]:checked')?.value || '추천함';
        const movieTitle = window.currentMovieTitle;
        
        // ✅ submitReview 호출 (비동기이므로 폼 초기화는 submitReview 내부에서 처리)
        submitReview(movieTitle, rating, commentText, recommend);
    });


    // 리뷰 취소 버튼 클릭 이벤트 추가
    document.getElementById('cancelComment').addEventListener('click', () => {
        const commentForm = document.getElementById('commentForm');
        commentForm.style.display = 'none'; // 폼 숨기기
        document.getElementById('commentWriteButton').style.display = 'block'; // 버튼 다시 표시
    });
}
// 별점 UI표시시
function renderStarRating(selected = 0) {
    const starContainer = document.getElementById('starRating');
    if (!starContainer) {
        console.error('starRating 요소를 찾을 수 없습니다!');
        return;
    }
    
    // ✅ data-selected 먼저 설정
    starContainer.dataset.selected = selected;
    
    starContainer.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
        const star = document.createElement('i');
        star.className = 'fa fa-star star-icon' + (i <= selected ? ' selected' : '');
        star.dataset.value = i;
        star.addEventListener('click', function() {
            console.log('별 클릭:', i); // 디버깅
            renderStarRating(i); // 선택된 별 개수만큼 다시 렌더링
        });
        starContainer.appendChild(star);
    }
    
    console.log('별점 설정됨:', starContainer.dataset.selected); // 디버깅
}

// 페이지 전환 함수 (단일 전역 구현)
function switchPage(pageId) {
    // 모든 페이지 숨기기
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));

    // 선택한 페이지 표시
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');

    // URL 변경 (브라우저 히스토리에 추가)
    const url = pageId === 'movies' ? '/' : `/?page=${pageId}`;
    // pushState는 동일한 상태를 중복으로 추가하지 않도록 replaceState로 시작 페이지를 조정 가능
    window.history.pushState({ page: pageId }, '', url);

    // 현재 페이지 상태 업데이트
    window.currentPage = pageId;

    // 갤러리 페이지로 전환할 때 게시판 데이터 로드
    if (pageId === 'gallery') loadBoardData();

    // 로그인/로그아웃 버튼 이벤트 리스너가 페이지 로드마다 중복 등록되지 않도록
    // (초기화 시 한 번 등록되어야 함) — 이미 setupEventListeners에서 등록됨.
}

// 페이지네이션 변수
let currentPage = 1;
const postsPerPage = 10; // 페이지당 게시글 수

// 갤러리 게시판 데이터 로드
function loadBoardData(page = 1) {
        const moviesGrid = document.getElementById('moviesGrid');
        moviesGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>영화 정보를 불러오는 중...</p></div>';

        // 비동기 작업 시뮬레이션 (실제로는 서버 API 호출)
        setTimeout(() => {
            let html = '';

            movieData.movies.forEach(movie => {
                const tomatoClass = parseInt(movie.reviewer) > 75 ? 'gold' : '';

                html += `
                <div class="movie-card" data-id="${movie.id}">
                    <div class="poster-container">
                        <img src="${movie.poster}" alt="${movie.title}">
                        <div class="play-button">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                    <div class="movie-info">
                        <div class="ratings">
                            <span class="reviewer ${tomatoClass}">${movie.reviewer}</span>
                            <span class="audience">${movie.audience}</span>
                        </div>
                        <h3 class="movie-title">${movie.title}</h3>
                        <p class="movie-date">개봉일: ${formatDate(movie.releaseDate)}</p>
                        <button class="watchlist-btn">WATCHLIST</button>
                    </div>
                </div>
            `;
            });

            moviesGrid.innerHTML = html;

            // 영화 카드 클릭 이벤트
            const movieCards = document.querySelectorAll('.movie-card');
            movieCards.forEach(card => {
                card.addEventListener('click', function () {
                    const movieId = this.getAttribute('data-id');
                    showMovieDetail(movieId);
                });
            });

            // [여기에 추가] 플레이버튼 클릭 이벤트
            document.querySelectorAll('.play-button').forEach(btn => {
                btn.addEventListener('click', function (e) {
                    e.stopPropagation(); // 카드 클릭 방지
                    const card = btn.closest('.movie-card');
                    const movieId = card.getAttribute('data-id');
                    const movie = movieData.movies.find(m => m.id == movieId);
                    if (movie && movie.trailerYoutubeId) {
                        openTrailerModal(movie.trailerYoutubeId);
                    } else {
                        alert('예고편 정보가 없습니다.');
                    }
                });
            });

        }, 1000); // 1초 지연 (로딩 시뮬레이션)
    }


    // AI 리뷰 생성성
    // 감정 키워드 버튼 렌더링 (최대 10개 선택)
    function renderEmotionButtons() {
        const container = document.getElementById('emotionButtons');
        container.innerHTML = '';
        EMOTION_KEYWORDS.forEach(keyword => {
            const btn = document.createElement('button');
            btn.textContent = keyword;
            btn.className = 'emotion-btn';
            btn.onclick = function () {
                btn.classList.toggle('selected');
                const selected = container.querySelectorAll('.selected');
                if (selected.length > 10) {
                    btn.classList.remove('selected');
                    alert('감정 키워드는 최대 10개까지 선택할 수 있습니다.');
                }
            };
            container.appendChild(btn);
        });
    }

    // 평점 버튼 렌더링 (1~10점, 1개만 선택)
    function renderScoreButtons() {
        const container = document.getElementById('scoreButtons');
        container.innerHTML = '';
        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = 'score-btn';
            btn.onclick = function () {
                container.querySelectorAll('.score-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                lastSelectedScore = i; // ✅ 선택한 평점 저장
            };
            container.appendChild(btn);
        }
    }

    // 추천 여부 버튼 렌더링 (3개 중 1개만 선택)
    function renderRecommendButtons() {
        const container = document.getElementById('recommendButtons');
        container.innerHTML = '';
        RECOMMEND_OPTIONS.forEach(option => {
            const btn = document.createElement('button');
            btn.textContent = option;
            btn.className = 'recommend-btn';
            btn.onclick = function () {
                container.querySelectorAll('.recommend-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                lastSelectedRecommend = option; // 여기서 기억!
            };
            container.appendChild(btn);
        });
    }


    // 갤러리 게시물 로드
    function loadGalleryPosts() {
        const galleryPosts = document.getElementById('galleryPosts');
        galleryPosts.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>게시물을 불러오는 중...</p></div>';
        setTimeout(() => {
            let html = '';
            movieData.galleryPosts.forEach(post => {
                html += `
                <div class="post" data-id="${post.id}">
                    <div class="post-thumbnail">
                        <img src="${post.thumbnail}" alt="">
                    </div>
                    <div class="post-info">
                        <h3 class="post-title">${post.title}</h3>
                        <div class="post-meta">
                            <span class="post-author">${post.author}</span>
                            <span class="post-date">${post.date}</span>
                        </div>
                    </div>
                </div>
            `;
            });
            galleryPosts.innerHTML = html;

            // [중요] 게시글 클릭 이벤트 연결
            const posts = document.querySelectorAll('.post');
            posts.forEach(post => {
                post.addEventListener('click', function () {
                    const postId = this.getAttribute('data-id');
                    showPostDetail(postId);
                });
            });
        }, 800);
    }


    function loadBoardData(page = 1) {
        currentPage = page;
        const boardContent = document.getElementById('board-content');
        boardContent.innerHTML = `<tr><td colspan="7">불러오는 중...</td></tr>`;

        // Supabase에서 게시글 조회
        supabase
            .from('posts')
            .select(`
                *,
                users (username)
            `)
            .order('created_at', { ascending: false })
            .then(({ data: posts, error }) => {
                if (error) {
                    console.error('게시글 로드 오류:', error);
                    boardContent.innerHTML = `<tr><td colspan="7">게시글을 불러올 수 없습니다.</td></tr>`;
                    return;
                }
                
                if (!posts || !posts.length) {
                    boardContent.innerHTML = `<tr><td colspan="7">등록된 게시물이 없습니다.</td></tr>`;
                    renderPagination(0);
                    return;
                }
            
                // ✅ 페이지네이션 계산
                const totalPosts = posts.length;
                const totalPages = Math.ceil(totalPosts / postsPerPage);
                const startIndex = (page - 1) * postsPerPage;
                const endIndex = startIndex + postsPerPage;
                const currentPosts = posts.slice(startIndex, endIndex);
            
                boardContent.innerHTML = '';
                currentPosts.forEach(post => {
                    const postUsername = post.users?.username || '익명';
                    // ✅ 본인이 작성한 글인지 확인 (username 비교)
                    const isOwner = window.currentUsername && window.currentUsername === postUsername;
                    const deleteBtnHtml = isOwner
                        ? `<button class="delete-post-btn" data-id="${post.id}" style="color: white; background: #d9230f; border: none; border-radius: 4px; padding: 4px 10px; cursor: pointer;">삭제</button>`
                        : '';
                    const row = document.createElement('tr');
                    row.innerHTML = `
                    <td>${post.id}</td>
                    <td><a href="#" class="post-link" data-id="${post.id}">${post.title}</a></td>
                    <td>${postUsername}</td>
                    <td>${(post.created_at || "").slice(0, 10)}</td>
                    <td>${post.views || 0}</td>
                    <td>${post.recommend || 0}</td>
                    <td>${deleteBtnHtml}</td>
                `;
                    boardContent.appendChild(row);
                });

                // ✅ 페이지네이션 렌더링
                renderPagination(totalPages);

                // 게시글 제목 클릭(상세보기 등) 이벤트 옵션
                document.querySelectorAll('.post-link').forEach(link => {
                    link.addEventListener('click', function (e) {
                        e.preventDefault();
                        const postId = this.dataset.id;
                        showPostDetail(postId);
                    });
                });
            
                // 게시글 삭제 이벤트 등록
                document.querySelectorAll('.delete-post-btn').forEach(btn => {
                    btn.addEventListener('click', async function () {
                        const postId = parseInt(this.dataset.id);
                        if (confirm('정말 삭제하시겠습니까?')) {
                            try {
                                const { error } = await supabase
                                    .from('posts')
                                    .delete()
                                    .eq('id', postId);
                                
                                if (error) throw error;
                                
                                alert('게시글이 삭제되었습니다!');
                                loadBoardData(currentPage); // 현재 페이지 유지하며 새로고침
                            } catch (err) {
                                console.error('삭제 오류:', err);
                                alert('삭제 실패: ' + err.message);
                            }
                        }
                    });
                });
            })
            .catch(err => {
                boardContent.innerHTML = `<tr><td colspan="7">에러 발생: ${err.message}</td></tr>`;
            });
    }

    // 페이지네이션 렌더링 함수
    function renderPagination(totalPages) {
        const pagination = document.querySelector('.pagination');
        if (!pagination) return;
    
        pagination.innerHTML = '';
    
        if (totalPages === 0) {
            return;
        }
    
        // 이전 버튼
        if (currentPage > 1) {
            const prevBtn = document.createElement('a');
            prevBtn.href = '#';
            prevBtn.innerHTML = '<i class="fas fa-angle-left"></i> 이전';
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                loadBoardData(currentPage - 1);
            });
            pagination.appendChild(prevBtn);
        }
    
        // 페이지 번호 (최대 5개 표시)
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
        // 끝 페이지 기준으로 시작 페이지 재조정
        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
    
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('a');
            pageBtn.href = '#';
            pageBtn.textContent = i;
            if (i === currentPage) {
                pageBtn.classList.add('active');
            }
            pageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                loadBoardData(i);
            });
            pagination.appendChild(pageBtn);
        }
    
        // 다음 버튼
        if (currentPage < totalPages) {
            const nextBtn = document.createElement('a');
            nextBtn.href = '#';
            nextBtn.innerHTML = '다음 <i class="fas fa-angle-right"></i>';
            nextBtn.classList.add('next');
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                loadBoardData(currentPage + 1);
            });
            pagination.appendChild(nextBtn);
        }
    }



    // 영화 상세 정보 표시
    function showMovieDetail(movieId) {
        const movieDetailContent = document.getElementById('movieDetailContent');
        movieDetailContent.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>영화 상세정보를 불러오는 중...</p></div>';

        // ✅ 수정: 페이지만 전환하고 히스토리는 직접 관리
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('movie-detail').classList.add('active');
        window.currentPage = 'movie-detail';

        // ✅ URL에 영화 ID 추가
        window.history.pushState({ page: 'movie-detail', movieId }, '', `/?movieId=${movieId}`);

        // 영화 데이터 조회
        const movie = movieData.movies.find(m => m.id == movieId);
        if (!movie) {
            movieDetailContent.innerHTML = '<p>영화 정보를 찾을 수 없습니다.</p>';
            return;
        }

        // 현재 영화 제목을 전역 변수에 저장 (댓글 등록/조회 API 연동에 필수!)
        window.currentMovieTitle = movie.title;

        setTimeout(() => {
            let html = `
            <div class="movie-detail-banner" style="background-image: url('https://via.placeholder.com/1200x400?text=${encodeURIComponent(movie.title)}')">
                <div class="banner-overlay">
                    <div class="movie-detail-content">
                        <div class="movie-poster-large">
                            <img src="${movie.poster}" alt="${movie.title}">
                        </div>
                        <div class="movie-detail-info">
                            <h1 class="movie-detail-title">${movie.title}</h1>
                            <p class="movie-detail-original">${movie.originalTitle}</p>
                            <div class="movie-detail-meta">
                                <p><strong>장르:</strong> ${movie.genres.join(', ')}</p>
                                <p><strong>감독:</strong> ${movie.directors.join(', ')}</p>
                                <p><strong>출연:</strong> ${movie.actors.join(', ')}</p>
                                <p><strong>상영시간:</strong> ${movie.runtime}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="movie-stats">
                <div class="stat-group">
                    <div class="stat-item">
                        <span class="stat-value" id="audienceScore">${movie.audience}</span>
                        <span class="stat-label">관객평</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" id="reviewerScore">${movie.reviewer}</span>
                        <span class="stat-label">평론평</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" id="totalScore">-</span>
                        <span class="stat-label">총평</span>
                    </div>
                </div>
            </div>
            <div class="movie-tabs">
                <button class="tab-btn active">관람평(관객평)</button>
            </div>
            <div class="reviews-container">
                <h3 id="reviewTitle">${movie.title}에 대한 <span id="commentCount">0</span>개의 이야기가 있어요!</h3>
                <div class="comments-list" id="commentsList"></div>
            </div>
        `;
            movieDetailContent.innerHTML = html;

            // 탭 버튼 이벤트 리스너 (필요시)
            const tabButtons = document.querySelectorAll('.tab-btn');
            tabButtons.forEach(button => {
                button.addEventListener('click', function () {
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    // 탭 콘텐츠 전환 로직 (필요시 구현)
                });
            });

            // DB에서 댓글(리뷰) 불러오기 및 총평 갱신
            loadComments(movie.title, movie);
        }, 1200); // 1.2초 지연 (로딩 효과)
    }

    // 관객평(관람평) 목록 불러오기 및 총평 갱신
    async function loadComments(movieTitle, movie) {
        console.log('🔍 loadComments 호출됨 - 영화:', movieTitle);
        
        try {
            // Supabase 클라이언트로 직접 조회
            const { data: comments, error } = await supabase
                .from('reviews')
                .select(`
                    *,
                    users (username)
                `)
                .eq('movie_title', movieTitle)
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('리뷰 로드 오류:', error);
                return;
            }
            
            // username을 comments 객체에 직접 설정
            const commentsWithUsername = await Promise.all(comments.map(async comment => {
                // 좋아요/싫어요 카운트 가져오기
                const { count: likesCount } = await supabase
                    .from('review_likes')
                    .select('*', { count: 'exact', head: true })
                    .eq('review_id', comment.id)
                    .eq('like_type', 'like');
                
                const { count: dislikesCount } = await supabase
                    .from('review_likes')
                    .select('*', { count: 'exact', head: true })
                    .eq('review_id', comment.id)
                    .eq('like_type', 'dislike');
                
                return {
                    ...comment,
                    username: comment.users?.username || '익명',
                    likes_count: likesCount || 0,
                    dislikes_count: dislikesCount || 0
                };
            }));
            
            console.log('📦 받은 리뷰 데이터:', commentsWithUsername);
            const commentsList = document.getElementById('commentsList');
            console.log('📍 commentsList 요소:', commentsList);
            commentsList.innerHTML = '';
        
            // ✅ 리뷰가 없으면 안내 메시지 표시
            if (commentsWithUsername.length === 0) {
                console.log('⚠️ 리뷰가 없음 - 안내 메시지 표시');
                commentsList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">아직 작성된 관람평이 없습니다. 첫 번째 관람평을 작성해보세요!</p>';
            } else {
                console.log('✅ 리뷰 개수:', commentsWithUsername.length);
                commentsWithUsername.forEach(comment => {
                        // ✅ 본인이 작성한 댓글인지 확인 (username 비교)
                        const isOwner = window.currentUsername && window.currentUsername === comment.username;
                        const deleteBtnHtml = isOwner
                            ? `<button class="delete-comment" data-id="${comment.id}" style="color: white; background: #d9230f; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px;">삭제</button>`
                            : '';
                        const commentItem = document.createElement('div');
                        commentItem.className = 'comment-item';
                        commentItem.innerHTML = `
                <p class="username">${comment.username || '익명'}</p>
                <p>
                    <span class="rating-score">★ ${comment.rating}/10</span>
                    <span class="recommend-label">${comment.recommend ? '· ' + comment.recommend : ''}</span>
                </p>
                <p>${comment.content}</p>
                <span class="date">${new Date(comment.created_at).toLocaleString('ko-KR')}</span>
                ${deleteBtnHtml}
                <div class="like-buttons">
                    <button class="like-btn" data-review-id="${comment.id}" data-type="like">
                        <i class="fas fa-thumbs-up"></i>
                        <span class="like-count">${comment.likes_count || 0}</span>
                    </button>
                    <button class="dislike-btn" data-review-id="${comment.id}" data-type="dislike">
                        <i class="fas fa-thumbs-down"></i>
                        <span class="dislike-count">${comment.dislikes_count || 0}</span>
                    </button>
                </div>
              `;
                        commentsList.appendChild(commentItem);
                    });
                }
            
            document.getElementById('commentCount').textContent = commentsWithUsername.length;

            // ✅ 좋아요/싫어요 버튼 상태 불러오기 및 이벤트 연결
            loadReviewLikeStates(commentsWithUsername);
            attachReviewLikeEvents();

            // 1. 관객평(관람평 평균) 계산
            let audienceScore = '-';
            if (commentsWithUsername.length > 0) {
                const sum = commentsWithUsername.reduce((acc, c) => acc + Number(c.rating), 0);
                audienceScore = (sum / commentsWithUsername.length).toFixed(1) + '/10';
            } else {
                // 관객평 없으면 movie.audience 사용
                const foundMovie = movieData.movies.find(m => m.title === movieTitle);
                audienceScore = foundMovie ? foundMovie.audience : '-';
            }
            document.getElementById('audienceScore').textContent = audienceScore;
            
            // 2. 총평 계산 및 UI 반영
            const totalScore = getTotalScore(audienceScore, movie.reviewer, commentsWithUsername);
            document.getElementById('totalScore').textContent = totalScore;

            // 삭제 버튼 이벤트 연결
            document.querySelectorAll('.delete-comment').forEach(btn => {
                btn.addEventListener('click', async function () {
                    const reviewId = this.dataset.id;
                    if (confirm('정말 삭제하시겠습니까?')) {
                        try {
                            const { error } = await supabase
                                .from('reviews')
                                .delete()
                                .eq('id', reviewId)
                                .eq('user_id', window.currentUserId);
                            
                            if (error) throw error;
                            
                            alert('리뷰가 삭제되었습니다!');
                            loadComments(movieTitle, movie);
                        } catch (err) {
                            console.error('삭제 오류:', err);
                            alert('삭제 실패: ' + err.message);
                        }
                    }
                });
            });
        } catch (err) {
            console.error('loadComments 오류:', err);
        }
    }

    // 총평 계산 함수 (리뷰 수 많을수록 영향력 증가)
    function getTotalScore(audience, reviewer, reviews) {
        function parseScore(score) {
            if (typeof score === 'string') {
                const match = score.match(/([\d.]+)/);
                return match ? parseFloat(match[1]) : 0;
            }
            return Number(score) || 0;
        }
        const a = parseScore(audience);
        const r = parseScore(reviewer);
        const reviewAvg = reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length)
            : null;

        if (!reviews.length || reviewAvg === null) {
            return ((a * 0.7 + r * 0.3).toFixed(1)) + '/10';
        }

        let cWeight = Math.min(3, 0.5 + reviews.length * 0.25); // 최대 3
        let aWeight = 0.7, rWeight = 0.3;
        const total = (a * aWeight + r * rWeight + reviewAvg * cWeight) / (aWeight + rWeight + cWeight);
        return total.toFixed(1) + '/10';
    }

    // 리뷰 평점 평균 계산
    function calculateAverageReviewScore(reviews) {
        if (!reviews.length) return null;
        const total = reviews.reduce((sum, r) => sum + Number(r.rating), 0);
        return (total / reviews.length).toFixed(1);
    }

    // 리뷰 저장
    async function submitReview(movieTitle, rating, content, recommend) {
        console.log('리뷰 제출:', { movieTitle, rating, content, recommend });
    
        try {
            // Supabase 클라이언트로 직접 insert
            const { data, error } = await supabase
                .from('reviews')
                .insert({
                    user_id: parseInt(window.currentUserId),
                    movie_title: movieTitle,
                    rating: parseInt(rating),
                    content: content,
                    recommend: recommend
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            console.log('✅ 리뷰 저장 성공:', data);
            alert('리뷰가 등록되었습니다!');
        
            // ✅ 리뷰 목록 먼저 다시 로드
            const movie = movieData.movies.find(m => m.title === movieTitle);
            console.log('🔄 리뷰 목록 갱신 시작...');
            loadComments(movieTitle, movie);
        
            // ✅ 폼 초기화는 잠시 뒤에
            setTimeout(() => {
                document.getElementById('commentForm').style.display = 'none';
                document.getElementById('commentWriteButton').style.display = 'block';
                document.getElementById('commentText').value = '';
                renderStarRating(0);
                console.log('🧹 폼 초기화 완료');
            }, 500);
        } catch (err) {
            console.error('리뷰 저장 오류:', err);
            alert('리뷰 저장 실패: ' + err.message);
        }
    }


    // 게시물 상세 내용 표시
    function showPostDetail(postId, skipHistory = false) {
        const postDetailContent = document.getElementById('postDetailContent');
        postDetailContent.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>게시물을 불러오는 중...</p></div>';
        // ✅ 수정: 페이지만 전환
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('post-detail').classList.add('active');
        window.currentPage = 'post-detail';
    
        // ✅ skipHistory가 false일 때만 히스토리 추가 (중복 방지)
        if (!skipHistory) {
            window.history.pushState({ page: 'post-detail', postId }, '', `/?postId=${postId}`);
        }

    supabase
        .from('posts')
        .select(`
            *,
            users(username)
        `)
        .eq('id', postId)
        .single()
        .then(async ({ data: post, error }) => {
            if (error) throw new Error('게시물을 찾을 수 없습니다.');
            
            // 좋아요/싫어요 카운트 가져오기
            const { count: likesCount } = await supabase
                .from('post_likes')
                .select('*', { count: 'exact', head: true })
                .eq('post_id', postId)
                .eq('like_type', 'like');
            
            const { count: dislikesCount } = await supabase
                .from('post_likes')
                .select('*', { count: 'exact', head: true })
                .eq('post_id', postId)
                .eq('like_type', 'dislike');
            
            let html = `
            <div class="post-detail-header">
                <h1 class="post-detail-title">${post.title}</h1>
                <div class="post-detail-meta">
                    <span class="post-detail-author">${post.users?.username || '익명'}</span>
                    <span class="post-detail-date">${new Date(post.created_at).toLocaleString('ko-KR')}</span>
                </div>
                <div class="like-buttons" style="margin-top: 15px;">
                    <button class="post-like-btn" data-post-id="${post.id}" data-type="like">
                        <i class="fas fa-thumbs-up"></i>
                        <span class="like-count">${likesCount || 0}</span>
                    </button>
                    <button class="post-dislike-btn" data-post-id="${post.id}" data-type="dislike">
                        <i class="fas fa-thumbs-down"></i>
                        <span class="dislike-count">${dislikesCount || 0}</span>
                    </button>
                </div>
            </div>
            <div class="post-detail-body">
                <p>${post.content.replace(/\n/g, '<br>')}</p>
            </div>
        `;
            postDetailContent.innerHTML = html;

            // ✅ 게시글 좋아요 상태 불러오기 및 이벤트 연결
            loadPostLikeState(postId);
            attachPostLikeEvents(postId);                // ✅ URL에 게시글 ID 추가
                //window.history.pushState({ page: 'post-detail', postId }, '', `/?postId=${postId}`);

                // ✅ 게시글을 성공적으로 불러온 후, 댓글 기능을 활성화합니다.
                loadPostComments(postId);
            })
            .catch(err => {
                postDetailContent.innerHTML = `<p style="text-align:center; color: #888;">${err.message}</p>`;
            });
    }

    // 검색 기능
    async function performSearch() {
        // movieData가 로드되었는지 확인하는 안전장치
        if (typeof movieData === 'undefined' || !movieData.movies) {
            alert('영화 데이터가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
            console.error('movieData is not defined or does not contain movies array.');
            return;
        }

        const searchInput = document.getElementById('searchInput');
        const searchTerm = searchInput.value.trim().toLowerCase();

        if (!searchTerm) {
            alert('검색어를 입력해주세요.');
            return;
        }

        // 1. 검색 결과 페이지로 전환하고 로딩 표시
        switchPage('search-results');
        const moviesResultGrid = document.getElementById('searchMoviesGrid');
        const postsResultTable = document.getElementById('searchPostsTableBody');
        document.getElementById('searchTermDisplay').textContent = searchInput.value.trim(); // 소문자로 바꾸기 전 원본 검색어 표시

        moviesResultGrid.innerHTML = '<div class="loading"><p>영화를 검색하는 중...</p></div>';
        postsResultTable.innerHTML = '<tr><td colspan="4">게시글을 검색하는 중...</td></tr>';

        // 2. 영화 검색 (안전장치가 추가된 버전)
        const movieResults = movieData.movies.filter(movie =>
            (movie.title && movie.title.toLowerCase().includes(searchTerm)) ||
            (movie.originalTitle && movie.originalTitle.toLowerCase().includes(searchTerm)) || // 한글 제목 검색 추가
            (movie.actors && movie.actors.some(actor => actor.toLowerCase().includes(searchTerm))) ||
            (movie.directors && movie.directors.some(director => director.toLowerCase().includes(searchTerm)))
        );

        if (movieResults.length > 0) {
            moviesResultGrid.innerHTML = movieResults.map(movie => `
            <div class="movie-card" data-id="${movie.id}">
                <div class="poster-container">
                    <img src="${movie.poster}" alt="${movie.title}">
                </div>
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                </div>
            </div>
        `).join('');
            moviesResultGrid.querySelectorAll('.movie-card').forEach(card => {
                card.addEventListener('click', function () { showMovieDetail(this.dataset.id); });
            });
        } else {
            moviesResultGrid.innerHTML = '<p>일치하는 영화가 없습니다.</p>';
        }

        // 3. 게시글 검색 (Supabase 직접 조회)
        try {
            const { data: postResults, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    users(username)
                `)
                .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            if (postResults && postResults.length > 0) {
                postsResultTable.innerHTML = postResults.map(post => `
                <tr>
                    <td>${post.id}</td>
                    <td><a href="#" class="post-link" data-id="${post.id}">${post.title}</a></td>
                    <td>${post.users?.username || "익명"}</td>
                    <td>${(post.created_at || "").slice(0, 10)}</td>
                </tr>
            `).join('');
                postsResultTable.querySelectorAll('.post-link').forEach(link => {
                    link.addEventListener('click', function (e) {
                        e.preventDefault();
                        showPostDetail(this.dataset.id);
                    });
                });
            } else {
                postsResultTable.innerHTML = '<tr><td colspan="4">일치하는 게시글이 없습니다.</td></tr>';
            }
        } catch (error) {
            console.error("게시글 검색 오류:", error);
            postsResultTable.innerHTML = '<tr><td colspan="4">게시글 검색 중 오류가 발생했습니다.</td></tr>';
        }
    }

    // // 날짜 포맷팅 (YYYY-MM-DD -> YYYY년 MM월 DD일)
    // function formatDate(dateString) {
    //     if (!dateString) return '';

    //     const parts = dateString.split('-');
    //     if (parts.length !== 3) return dateString;

    //     const year = parts[0];
    //     const month = parts[1];
    //     const day = parts[2];

    //     return `${year}년 ${month}월 ${day}일`;
    // }

    // // 숫자 포맷팅 (천 단위 구분)
    // function formatNumber(number) {
    //     return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    // }


    function toggleWriteForm() {
        const writeForm = document.getElementById('write-form');
        if (writeForm) {
            writeForm.style.display = writeForm.style.display === 'none' ? 'block' : 'none';
        }
    }

    // ✅ post-form이 존재할 때만 이벤트 등록
    const postForm = document.getElementById('post-form');
    if (postForm) {
        postForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const title = document.getElementById('post-title').value.trim();
            const content = document.getElementById('post-content').value.trim();
            //const userId = 1; // 실제 로그인 연동 시 변경

            if (!title || !content) {
                alert('제목과 내용을 입력하세요.');
                return;
            }

            submitPost(title, content);
        });
    }

    async function submitPost(title, content) {
        try {
            const { data, error } = await supabase
                .from('posts')
                .insert({
                    user_id: parseInt(window.currentUserId),
                    title: title,
                    content: content
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            alert('게시글이 등록되었습니다!');
            window.location.reload();
        } catch (err) {
            console.error('게시글 작성 오류:', err);
            alert('오류: ' + err.message);
        }
    }

    // 댓글 불러오기, 작성, 삭제 기능 함수 (새로 추가 또는 교체)
    function loadPostComments(postId) {
        const commentsList = document.getElementById('comments-list');
        const commentInput = document.getElementById('comment-input');
        const submitBtn = document.getElementById('comment-submit-btn');

        // ✅ 안전 장치: 요소가 없으면 경고 출력
        if (!commentsList || !commentInput || !submitBtn) {
            console.error('❌ 댓글 요소를 찾을 수 없습니다:', { commentsList, commentInput, submitBtn });
            return;
        }

        console.log('✅ 댓글 섹션 로드 시작 - postId:', postId);

        // --- 1. Supabase에서 댓글 목록 불러와서 화면에 그리기 ---
        supabase
            .from('comments')
            .select(`
                *,
                users (username)
            `)
            .eq('post_id', parseInt(postId))
            .order('created_at', { ascending: true })
            .then(({ data: comments, error }) => {
                if (error) {
                    console.error('댓글 로딩 오류:', error);
                    return;
                }

                console.log('📦 받은 댓글 데이터:', comments);
                commentsList.innerHTML = ''; // 기존 댓글 목록 초기화
                if (comments.length === 0) {
                    commentsList.innerHTML = '<p class="no-comments">아직 댓글이 없습니다.</p>';
                } else {
                    comments.forEach(comment => {
                        // ✅ 본인이 작성한 리뷰인지 확인 (username 비교)
                        const username = comment.users?.username || '익명';
                        const isOwner = window.currentUsername && window.currentUsername === username;
                        const deleteBtnHtml = isOwner
                            ? `<button class="comment-delete-btn" data-id="${comment.id}" style="color: white; background: #d9230f; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px;">삭제</button>`
                            : '';

                        const commentEl = document.createElement('div');
                        commentEl.className = 'comment-item';
                        commentEl.innerHTML = `
                        <div class="comment-meta">
                            <span class="comment-author">${username}</span>
                            <span class="comment-date">${new Date(comment.created_at).toLocaleString('ko-KR')}</span>
                        </div>
                        <p class="comment-content">${comment.content}</p>
                        ${deleteBtnHtml}
                    `;
                        commentsList.appendChild(commentEl);
                    });
                }
            });

        // --- 2. '등록' 버튼 클릭 이벤트 설정 ---
        // (기존에 이벤트가 중복 등록되는 것을 방지하기 위해, 새로운 함수를 할당)
    
        submitBtn.onclick = () => {
            const content = commentInput.value.trim();
            if (!content) {
                alert('댓글 내용을 입력해주세요.');
                return;
            }

            // ✅ 로그인하지 않은 경우 작성 불가
            if (!window.currentUserId) {
                alert('로그인이 필요합니다.');
                return;
            }

            // Supabase 클라이언트로 직접 insert
            supabase
                .from('comments')
                .insert({
                    user_id: parseInt(window.currentUserId),
                    post_id: parseInt(postId),
                    content: content
                })
                .select()
                .single()
                .then(({ data, error }) => {
                    if (error) {
                        throw error;
                    }
                    
                    alert('댓글이 등록되었습니다!');
                    commentInput.value = ''; // 입력창 비우기
                    loadPostComments(postId); // ✅ 댓글 목록 새로고침해서 바로 반영!
                })
                .catch(err => {
                    console.error('댓글 작성 오류:', err);
                    alert('댓글 작성 실패: ' + err.message);
                });
        };

        // --- 3. '삭제' 버튼 클릭 이벤트 설정 (이벤트 위임) ---
        // (댓글 목록 전체에 하나의 이벤트 리스너만 추가하여 효율적으로 관리)
        commentsList.onclick = (event) => {
            // 클릭된 요소가 '삭제' 버튼일 때만 작동
            if (event.target.classList.contains('comment-delete-btn')) {
                if (confirm('정말 이 댓글을 삭제하시겠습니까?')) {
                    const commentId = event.target.dataset.id; // ✅ data-id로 통일

                    // Supabase 클라이언트로 직접 delete
                    supabase
                        .from('comments')
                        .delete()
                        .eq('id', parseInt(commentId))
                        .then(({ data, error }) => {
                            if (error) {
                                throw error;
                            }
                            
                            alert('댓글이 삭제되었습니다!');
                            loadPostComments(postId); // ✅ 댓글 목록 새로고침해서 바로 반영!
                        })
                        .catch(err => {
                            console.error('댓글 삭제 오류:', err);
                            alert('서버 오류: ' + err.message);
                        });
                }
            }
        };
    }

// ========================================================
// 👍 리뷰 좋아요/싫어요 기능
// ========================================================

// 리뷰 좋아요 상태 불러오기
async function loadReviewLikeStates(reviews) {
    if (!window.currentUserId) return; // 로그인 안했으면 스킵

    for (const review of reviews) {
        try {
            const { data, error } = await supabase
                .from('review_likes')
                .select('like_type')
                .eq('review_id', review.id)
                .eq('user_id', window.currentUserId)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                const likeBtn = document.querySelector(`.like-btn[data-review-id="${review.id}"]`);
                if (likeBtn && data.like_type === 'like') {
                    likeBtn.classList.add('active');
                }
                const dislikeBtn = document.querySelector(`.dislike-btn[data-review-id="${review.id}"]`);
                if (dislikeBtn && data.like_type === 'dislike') {
                    dislikeBtn.classList.add('active');
                }
            }
        } catch (err) {
            console.error('좋아요 상태 로드 오류:', err);
        }
    }
}

// 리뷰 좋아요/싫어요 버튼 이벤트 연결
function attachReviewLikeEvents() {
    document.querySelectorAll('.like-btn, .dislike-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            if (!window.currentUserId) {
                alert('로그인이 필요합니다!');
                return;
            }

            const reviewId = parseInt(this.dataset.reviewId);
            const likeType = this.dataset.type; // 'like' or 'dislike'
            const isActive = this.classList.contains('active');

            try {
                // 1. 기존 좋아요 상태 확인
                const { data: existingLike } = await supabase
                    .from('review_likes')
                    .select('*')
                    .eq('review_id', reviewId)
                    .eq('user_id', window.currentUserId)
                    .maybeSingle();

                let action = '';

                if (existingLike) {
                    if (existingLike.like_type === likeType) {
                        // 같은 버튼 클릭 → 취소
                        await supabase
                            .from('review_likes')
                            .delete()
                            .eq('review_id', reviewId)
                            .eq('user_id', window.currentUserId);
                        action = 'removed';
                    } else {
                        // 다른 버튼 클릭 → 변경
                        await supabase
                            .from('review_likes')
                            .update({ like_type: likeType })
                            .eq('review_id', reviewId)
                            .eq('user_id', window.currentUserId);
                        action = 'changed';
                    }
                } else {
                    // 새로 추가
                    await supabase
                        .from('review_likes')
                        .insert({ review_id: reviewId, user_id: window.currentUserId, like_type: likeType });
                    action = 'added';
                }

                // 2. 최신 카운트 가져오기
                const { data: likesCount } = await supabase
                    .from('review_likes')
                    .select('*', { count: 'exact', head: true })
                    .eq('review_id', reviewId)
                    .eq('like_type', 'like');

                const { data: dislikesCount } = await supabase
                    .from('review_likes')
                    .select('*', { count: 'exact', head: true })
                    .eq('review_id', reviewId)
                    .eq('like_type', 'dislike');

                // 3. UI 업데이트
                const likeBtn = document.querySelector(`.like-btn[data-review-id="${reviewId}"]`);
                const dislikeBtn = document.querySelector(`.dislike-btn[data-review-id="${reviewId}"]`);
                
                if (likeBtn) {
                    likeBtn.querySelector('.like-count').textContent = likesCount?.count || 0;
                    likeBtn.classList.remove('active');
                }
                if (dislikeBtn) {
                    dislikeBtn.querySelector('.dislike-count').textContent = dislikesCount?.count || 0;
                    dislikeBtn.classList.remove('active');
                }

                // 추가되었거나 변경되었으면 현재 버튼 활성화
                if (action === 'added' || action === 'changed') {
                    this.classList.add('active');
                }

            } catch (err) {
                console.error('좋아요 처리 오류:', err);
                alert('좋아요 처리 실패: ' + err.message);
            }
        });
    });
}

// ========================================================
// 👍 게시글 좋아요/싫어요 기능
// ========================================================

// 게시글 좋아요 상태 불러오기
async function loadPostLikeState(postId) {
    if (!window.currentUserId) return;

    try {
        const { data, error } = await supabase
            .from('post_likes')
            .select('like_type')
            .eq('post_id', postId)
            .eq('user_id', window.currentUserId)
            .maybeSingle();

        if (error) throw error;

        if (data) {
            const likeBtn = document.querySelector(`.post-like-btn[data-post-id="${postId}"]`);
            const dislikeBtn = document.querySelector(`.post-dislike-btn[data-post-id="${postId}"]`);
            
            if (likeBtn && data.like_type === 'like') {
                likeBtn.classList.add('active');
            }
            if (dislikeBtn && data.like_type === 'dislike') {
                dislikeBtn.classList.add('active');
            }
        }
    } catch (err) {
        console.error('게시글 좋아요 상태 로드 오류:', err);
    }
}

// 게시글 좋아요/싫어요 버튼 이벤트 연결
function attachPostLikeEvents(postId) {
    document.querySelectorAll('.post-like-btn, .post-dislike-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            if (!window.currentUserId) {
                alert('로그인이 필요합니다!');
                return;
            }

            const likeType = this.dataset.type; // 'like' or 'dislike'
            const postIdInt = parseInt(postId);

            try {
                // 1. 기존 좋아요 상태 확인
                const { data: existingLike } = await supabase
                    .from('post_likes')
                    .select('*')
                    .eq('post_id', postIdInt)
                    .eq('user_id', window.currentUserId)
                    .maybeSingle();

                let action = '';

                if (existingLike) {
                    if (existingLike.like_type === likeType) {
                        // 같은 버튼 클릭 → 취소
                        await supabase
                            .from('post_likes')
                            .delete()
                            .eq('post_id', postIdInt)
                            .eq('user_id', window.currentUserId);
                        action = 'removed';
                    } else {
                        // 다른 버튼 클릭 → 변경
                        await supabase
                            .from('post_likes')
                            .update({ like_type: likeType })
                            .eq('post_id', postIdInt)
                            .eq('user_id', window.currentUserId);
                        action = 'changed';
                    }
                } else {
                    // 새로 추가
                    await supabase
                        .from('post_likes')
                        .insert({ post_id: postIdInt, user_id: window.currentUserId, like_type: likeType });
                    action = 'added';
                }

                // 2. 최신 카운트 가져오기
                const { count: likesCount } = await supabase
                    .from('post_likes')
                    .select('*', { count: 'exact', head: true })
                    .eq('post_id', postIdInt)
                    .eq('like_type', 'like');

                const { count: dislikesCount } = await supabase
                    .from('post_likes')
                    .select('*', { count: 'exact', head: true })
                    .eq('post_id', postIdInt)
                    .eq('like_type', 'dislike');

                // 3. UI 업데이트
                const likeBtn = document.querySelector(`.post-like-btn[data-post-id="${postId}"]`);
                const dislikeBtn = document.querySelector(`.post-dislike-btn[data-post-id="${postId}"]`);
                
                if (likeBtn) {
                    likeBtn.querySelector('.like-count').textContent = likesCount || 0;
                    likeBtn.classList.remove('active');
                }
                if (dislikeBtn) {
                    dislikeBtn.querySelector('.dislike-count').textContent = dislikesCount || 0;
                    dislikeBtn.classList.remove('active');
                }

                // 추가되었거나 변경되었으면 현재 버튼 활성화
                if (action === 'added' || action === 'changed') {
                    this.classList.add('active');
                }

            } catch (err) {
                console.error('게시글 좋아요 처리 오류:', err);
                alert('좋아요 처리 실패: ' + err.message);
            }
        });
    });
}