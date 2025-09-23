
window.currentMovieTitle = null;

//최초 언어어
// [1] 파일 맨 상단(최초 window.currentMovieTitle 선언 근처)에 추가
const EMOTION_KEYWORDS = [
    "행복", "슬픔", "분노", "즐거움", "긴장됨", "우울", "무서움", "감동", "경이로움", "아쉬움",
    "희망", "실망", "설렘", "놀라움", "두려움", "그리움", "외로움", "평온함", "짜증", "뿌듯함",
    "피곤함", "지루함", "충격", "혼란", "불안", "만족", "자유로움", "고마움", "원망", "기대"
];
const RECOMMEND_OPTIONS = ["추천함", "추천하지 않음", "다시 보고 싶음"];

let lastSelectedRecommend = null;

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function () {
    // 초기 화면 설정
    initializeApp();

    // 이벤트 리스너 설정
    setupEventListeners();

    // 영화 데이터 로드
    loadMovies();

    loadGalleryPosts(); // 기존 갤러리 게시물 로드

    loadBoardData(); // 새로 작성한 게시판 데이터 로드
});

// 앱 초기화
function initializeApp() {
    // 현재 활성화된 페이지
    window.currentPage = 'movies';

    // URL 파라미터 분석
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('movieId');
    const postId = urlParams.get('postId');

    // 파라미터에 따라 적절한 페이지 표시
    if (movieId) {
        showMovieDetail(movieId);
    } else if (postId) {
        showPostDetail(postId);
    }
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


    document.getElementById('write-button').addEventListener('click', () => {
        const writeUrl = './write.html'; // 작성 페이지의 상대 경로 설정
        window.open(writeUrl, '_blank', 'noopener,noreferrer'); // 새 탭 열기
    });

    // 뒤로가기 버튼 클릭
    document.getElementById('backButton').addEventListener('click', function () {
        switchPage('movies');
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
    });

    // [2] setupEventListeners() 함수 내에 추가 AI 리뷰 생성성
    document.getElementById('aiReviewBtn').onclick = function () {
        document.getElementById('aiReviewModal').classList.add('show');
        renderEmotionButtons();
        renderScoreButtons();
        renderRecommendButtons();
        document.getElementById('aiReviewResult').innerHTML = '';
        document.getElementById('applyAIReview').style.display = 'none';
    };
    document.querySelector('.close-modal').onclick = function () {
        document.getElementById('aiReviewModal').classList.remove('show');
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
        lastSelectedRecommend = recommend;

        if (!movieTitle) return alert('영화 제목을 입력하세요.');
        if (emotions.length === 0) return alert('감정 키워드를 1개 이상 선택하세요.');
        if (!score) return alert('평점을 선택하세요.');
        if (!recommend) return alert('추천 여부를 선택하세요.');

        document.getElementById('aiReviewResult').innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> AI 관람평 생성 중...</div>';
        document.getElementById('applyAIReview').style.display = 'none';

        try {
            const res = await fetch('/api/ai-review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ movieTitle, emotions, recommend, score })
            });
            const data = await res.json();

            // 라디오 버튼과 함께 3개 리뷰 렌더링
            let html = '';
            data.reviews.forEach((review, idx) => {
                html += `
                    <label class="ai-review-radio-box">
                        <input type="radio" name="aiReviewRadio" value="${idx}" ${idx === 0 ? 'checked' : ''}>
                        <span class="review-label">관람평 ${idx + 1}</span>
                        <div class="review-content">${review}</div>
                    </label>
                `;
            });
            document.getElementById('aiReviewResult').innerHTML = html;
            document.getElementById('applyAIReview').style.display = 'inline-block';
        } catch (e) {
            document.getElementById('aiReviewResult').innerHTML = 'AI 리뷰 생성 실패';
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
        const reviewDivs = document.querySelectorAll('.review-content');
        let reviewText = reviewDivs[idx].innerText;
    
        // 감정 키워드 자동 제거 (이미 적용했다면 생략)
        // reviewText = removeEmotionKeywords(reviewText);
    
        // 평점 추출
        let rating = 5;
        const ratingMatch = reviewText.match(/([0-9]{1,2})점/);
        if (ratingMatch) rating = parseInt(ratingMatch[1], 10);
    
        // **추천여부는 팝업에서 사용자가 선택한 값 그대로 사용**
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
        // 임시 사용자 정보와 평점 (로그인 기능 없으면 하드코딩)
        // 아이디 다르게 저장
        const userId = Math.floor(Math.random() * 10000);
        const rating = Number(document.getElementById('starRating').dataset.selected) || 5;
        // 추천여부 값 가져오기
        const recommend = document.querySelector('input[name="recommend"]:checked')?.value || '추천함';
        const movieTitle = window.currentMovieTitle;
        submitReview(movieTitle, userId, rating, commentText, recommend);
        // 폼 초기화
        document.getElementById('commentForm').style.display = 'none';
        document.getElementById('commentWriteButton').style.display = 'block';
        document.getElementById('commentText').value = '';
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
    starContainer.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
        const star = document.createElement('i');
        star.className = 'fa fa-star star-icon' + (i <= selected ? ' selected' : '');
        star.dataset.value = i;
        star.onclick = function () {
            renderStarRating(i);
            starContainer.dataset.selected = i;
        };
        starContainer.appendChild(star);
    }
    starContainer.dataset.selected = selected;
}
// 리뷰 폼 열릴 때 호출
document.getElementById('commentWriteButton').addEventListener('click', () => {
    renderStarRating(0);
});


// 페이지 전환
function switchPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });

    document.getElementById(pageId).classList.add('active');

    // 페이지 전환 시 데이터 로드
    if (pageId === 'movies') {
        loadMovies();
    } else if (pageId === 'gallery') {
        loadBoardData();  // 게시판 데이터 로드 함수 호출
        loadGalleryPosts(); // 이 부분은 실제 쓰이는 용도에 따라 필요시 유지하거나 제거
    }

    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 영화 데이터 로드
function loadMovies() {
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


function loadBoardData() {
    const boardContent = document.getElementById('board-content');
    boardContent.innerHTML = `<tr><td colspan="6">불러오는 중...</td></tr>`;

    fetch('/api/posts')
        .then(res => res.json())
        .then(posts => {
            if (!posts.length) {
                boardContent.innerHTML = `<tr><td colspan="6">등록된 게시물이 없습니다.</td></tr>`;
                return;
            }
            boardContent.innerHTML = '';
            posts.forEach(post => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${post.id}</td>
                    <td><a href="#" class="post-link" data-id="${post.id}">${post.title}</a></td>
                    <td>${post.user_id || "익명"}</td>
                    <td>${(post.created_at || "").slice(0, 10)}</td>
                    <td>${post.views || 0}</td>
                    <td>${post.recommend || 0}</td>
                    <td><button class="delete-post-btn" data-id="${post.id}" style="color: white; background: #d9230f; border: none; border-radius: 4px; padding: 4px 10px; cursor: pointer;">삭제</button></td>
                `;
                boardContent.appendChild(row);
            });

            // 게시글 제목 클릭(상세보기 등) 이벤트 옵션
            document.querySelectorAll('.post-link').forEach(link => {
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    const postId = this.dataset.id;
                    showPostDetail(postId);
                });
            });
            // 게시글 삭제 이벤트 등록
            // ✅ 해결: 게시글이 모두 그려진 직후, 이 위치에서 이벤트를 등록해야 합니다.
            document.querySelectorAll('.delete-post-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const postId = this.dataset.id;
                    if (confirm('정말 삭제하시겠습니까?')) {
                        fetch(`/api/posts/${postId}`, { method: 'DELETE' })
                            .then(res => res.json())
                            .then(result => {
                                if (result.success) {
                                    alert('게시글이 삭제되었습니다!');
                                    loadBoardData(); // 목록 새로고침
                                } else {
                                    alert('삭제 실패!');
                                }
                            })
                            .catch(() => alert('서버 오류 발생!'));
                    }
                });
            });
        })
        .catch(err => {
            boardContent.innerHTML = `<tr><td colspan="6">에러 발생: ${err.message}</td></tr>`;
        });
    // 게시글 삭제 이벤트 등록
    // 🔴 문제의 원인: 이 코드가 fetch가 끝나기를 기다리지 않고 바로 실행됨
    // document.querySelectorAll('.delete-post-btn').forEach(btn => {
    //     btn.addEventListener('click', function () {
    //         const postId = this.dataset.id;
    //         if (confirm('정말 삭제하시겠습니까?')) {
    //             fetch(`/api/posts/${postId}`, { method: 'DELETE' })
    //                 .then(res => res.json())
    //                 .then(result => {
    //                     if (result.success) {
    //                         alert('게시글이 삭제되었습니다!');
    //                         loadBoardData(); // 목록 새로고침
    //                     } else {
    //                         alert('삭제 실패!');
    //                     }
    //                 })
    //                 .catch(() => alert('서버 오류 발생!'));
    //         }
    //     });
    // });

}



// 영화 상세 정보 표시
function showMovieDetail(movieId) {
    const movieDetailContent = document.getElementById('movieDetailContent');
    movieDetailContent.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>영화 상세정보를 불러오는 중...</p></div>';

    // 상세 페이지로 전환
    switchPage('movie-detail');

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
function loadComments(movieTitle, movie) {
    fetch(`/api/reviews?movie_title=${encodeURIComponent(movieTitle)}`)
        .then(res => res.json())
        .then(comments => {
            const commentsList = document.getElementById('commentsList');
            commentsList.innerHTML = '';
            comments.forEach(comment => {
                const commentItem = document.createElement('div');
                commentItem.className = 'comment-item';
                commentItem.innerHTML = `
            <p class="username">${comment.user_id || '익명'}</p>
            <p>
                <span class="rating-score">★ ${comment.rating}/10</span>
                <span class="recommend-label">${comment.recommend ? '· ' + comment.recommend : ''}</span>
            </p>
            <p>${comment.content}</p>
            <span class="date">${new Date(comment.created_at).toLocaleString('ko-KR')}</span>
            <button class="delete-comment" data-id="${comment.id}">삭제</button>
          `;
                commentsList.appendChild(commentItem);
            });
            document.getElementById('commentCount').textContent = comments.length;

            // 1. 관객평(관람평 평균) 계산
            let audienceScore = '-';
            if (comments.length > 0) {
                const sum = comments.reduce((acc, c) => acc + Number(c.rating), 0);
                audienceScore = (sum / comments.length).toFixed(1) + '/10';
            } else {
                // 관객평 없으면 movie.audience 사용
                // 관객평평 없으면 movie.js의 값 사용
                // movie 객체를 인자로 넘기는 게 더 안전
                const movie = movieData.movies.find(m => m.title === movieTitle);
                audienceScore = movie ? movie.audience : '-';
            }
            document.getElementById('audienceScore').textContent = audienceScore;
            // 2. 총평 계산 및 UI 반영
            const movie = movieData.movies.find(m => m.title === movieTitle);
            const totalScore = getTotalScore(audienceScore, movie.reviewer, comments);
            document.getElementById('totalScore').textContent = totalScore;

            // 삭제 버튼 이벤트 연결
            document.querySelectorAll('.delete-comment').forEach(btn => {
                btn.addEventListener('click', function () {
                    const reviewId = this.dataset.id;
                    if (confirm('정말 삭제하시겠습니까?')) {
                        fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' })
                            .then(res => res.json())
                            .then(() => loadComments(movieTitle, movie));
                    }
                });
            });
        });
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
function submitReview(movieTitle, userId, rating, content, recommend) {
    fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movie_title: movieTitle, user_id: userId, rating, content, recommend })
    })
        .then(res => res.json())
        .then(result => {
            // 저장 후 리뷰 목록 다시 불러오기
            const movie = movieData.movies.find(m => m.title === movieTitle);
            loadComments(movieTitle, movie);
        });
}


// 게시물 상세 내용 표시
function showPostDetail(postId) {
    const postDetailContent = document.getElementById('postDetailContent');
    postDetailContent.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>게시물을 불러오는 중...</p></div>';
    switchPage('post-detail');

    fetch(`/api/posts/${postId}`)
        .then(res => {
            if (!res.ok) throw new Error('게시물을 찾을 수 없습니다.');
            return res.json();
        })
        .then(post => {
            let html = `
                <div class="post-detail-header">
                    <h1 class="post-detail-title">${post.title}</h1>
                    <div class="post-detail-meta">
                        <span class="post-detail-author">${post.user_id || '익명'}</span>
                        <span class="post-detail-date">${new Date(post.created_at).toLocaleString('ko-KR')}</span>
                    </div>
                </div>
                <div class="post-detail-body">
                    <p>${post.content.replace(/\n/g, '<br>')}</p>
                </div>
            `;
            postDetailContent.innerHTML = html;

            // ✅ 게시글을 성공적으로 불러온 후, 댓글 기능을 활성화합니다.
            loadPostComments(postId);
        })
        .catch(err => {
            postDetailContent.innerHTML = `<p style="text-align:center; color: #888;">${err.message}</p>`;
        });
}

// 검색 기능
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim();

    if (!searchTerm) return;

    alert(`"${searchTerm}" 검색 결과는 준비 중입니다.`);
    // 실제 구현에서는 서버에 검색 요청을 보내고 결과를 표시
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
    writeForm.style.display = writeForm.style.display === 'none' ? 'block' : 'none';
}

// 이 부분은 함수 밖(전역)에 한 번만!
document.getElementById('post-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const title = document.getElementById('post-title').value.trim();
    const content = document.getElementById('post-content').value.trim();
    const userId = 1; // 실제 로그인 연동 시 변경

    if (!title || !content) {
        alert('제목과 내용을 입력하세요.');
        return;
    }

    submitPost(userId, title, content);
});

function submitPost(userId, title, content) {
    fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, title, content })
    })
        .then(res => res.json())
        .then(data => {
            alert('게시글이 등록되었습니다!');
            window.location.reload();
        })
        .catch(err => alert('오류: ' + err));
}

// 댓글 불러오기, 작성, 삭제 기능 함수 (새로 추가 또는 교체)
function loadPostComments(postId) {
    const commentsList = document.getElementById('comments-list');
    const commentInput = document.getElementById('comment-input');
    const submitBtn = document.getElementById('comment-submit-btn');

    // --- 1. 서버에서 댓글 목록 불러와서 화면에 그리기 ---
    fetch(`/api/comments?post_id=${postId}`)
        .then(res => res.json())
        .then(comments => {
            commentsList.innerHTML = ''; // 기존 댓글 목록 초기화
            if (comments.length === 0) {
                commentsList.innerHTML = '<p class="no-comments">아직 댓글이 없습니다.</p>';
            } else {
                comments.forEach(comment => {
                    const commentEl = document.createElement('div');
                    commentEl.className = 'comment-item';
                    commentEl.innerHTML = `
                        <div class="comment-meta">
                            <span class="comment-author">${comment.user_id || '익명'}</span>
                            <span class="comment-date">${new Date(comment.created_at).toLocaleString('ko-KR')}</span>
                        </div>
                        <p class="comment-content">${comment.content}</p>
                        <button class="comment-delete-btn" data-comment-id="${comment.id}">삭제</button>
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

        fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id: postId, user_id: '익명', content: content })
        })
        .then(res => res.json())
        .then(() => {
            commentInput.value = ''; // 입력창 비우기
            loadPostComments(postId); // ✅ 댓글 목록 새로고침해서 바로 반영!
        });
    };

    // --- 3. '삭제' 버튼 클릭 이벤트 설정 (이벤트 위임) ---
    // (댓글 목록 전체에 하나의 이벤트 리스너만 추가하여 효율적으로 관리)
    commentsList.onclick = (event) => {
        // 클릭된 요소가 '삭제' 버튼일 때만 작동
        if (event.target.classList.contains('comment-delete-btn')) {
            if (confirm('정말 이 댓글을 삭제하시겠습니까?')) {
                const commentId = event.target.dataset.commentId;

                fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
                    .then(res => res.json())
                    .then(result => {
                        if (result.success) {
                            loadPostComments(postId); // ✅ 댓글 목록 새로고침해서 바로 반영!
                        } else {
                            alert('삭제에 실패했습니다.');
                        }
                    });
            }
        }
    };
}