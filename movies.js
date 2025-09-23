const movieData = {
    movies: [
        {
            id: 1,
            title: "A Minecraft Movie",
            originalTitle: "마인크래프트 무비",
            poster: "https://www.kobis.or.kr/common/mast/movie/2025/04/thumb_x192/thn_53472665d45147f1bf8e83e13a58f500.jpg",
            reviewer: "4.5/10",
            audience: "8.5/10",
            releaseDate: "2025-04-04",
            description: "마인크래프트 세계를 배경으로 한 모험 영화",
            genres: ["모험", "코미디", "가족"],
            runtime: "105분",
            directors: ["조이 워들로우"],
            actors: ["제이슨 모모아", "잭 블랙", "제니퍼 쿨리지"],
            reviews: [
                { author: "MEGABOX", score: 8, text: "재미있게 봤습니다. 추천" },
                { author: "prty", score: 10, text: "마인크래프트 팬이라면 꼭 봐야합니다." }
            ],
            trailerYoutubeId: 'WUt3dVAIq_s'
        },
        {
            id: 2,
            title: "Disney's Snow White",
            originalTitle: "디즈니 백설공주",
            poster: "https://www.kobis.or.kr/common/mast/movie/2025/02/3a72b15160fa4db0b88b6785de82e5f3.jpg",
            reviewer: "4/10",
            audience: "7/10",
            releaseDate: "2025-03-21",
            description: "클래식 동화의 현대적 재해석",
            genres: ["모험", "판타지", "가족"],
            runtime: "110분",
            directors: ["마크 웹"],
            actors: ["레이첼 제글러", "갤 가돗", "앤드류 번햄"],
            reviews: [
                { author: "영화팬", score: 6, text: "원작의 매력을 살리지 못했습니다." },
                { author: "hpsdnwp", score: 7, text: "시각효과는 좋았으나 스토리가 아쉬움" }
            ],
            trailerYoutubeId: '9aAUvdtBg1w'
        },
        {
            id: 3,
            title: "Black Bag",
            originalTitle: "블랙 백",
            poster: "https://www.kobis.or.kr/common/mast/movie/2025/02/86ad9cefb7cb4dbaaea4541fcefefecf.jpg",
            reviewer: "9.5/10",
            audience: "7/10",
            releaseDate: "2025-03-14",
            description: "스릴러 액션 영화의 명작",
            genres: ["스릴러", "액션", "드라마"],
            runtime: "128분",
            directors: ["리 다니엘스"],
            actors: ["조쉬 브롤린", "비올라 데이비스", "마이클 키튼"],
            reviews: [
                { author: "영화광", score: 9, text: "올해 최고의 스릴러" },
                { author: "mjh94", score: 8, text: "연출과 연기가 일품입니다." }
            ],
            trailerYoutubeId: 'RdAkNlnxbKo'
        },
        {
            id: 4,
            title: "Mr. Robot",
            originalTitle: "미스터 로봇",
            poster: "https://www.kobis.or.kr/common/mast/movie/2025/03/22cb956527eb4e29a439a22e32c0e774.jpg",
            reviewer: "7.5/10",
            audience: "8.5/10",
            releaseDate: "2025-03-28",
            description: "현대 사회의 어두운 면을 파헤치는 사이버 스릴러",
            genres: ["스릴러", "드라마"],
            runtime: "135분",
            directors: ["샘 에스메일"],
            actors: ["라미 말렉", "크리스찬 슬레이터", "케일리 쿠오코"],
            audienceCount: 6554,
            rating: 7.8,
            reservationRate: "9%",
            reviews: [
                { author: "MEGABOX", score: 8, text: "재미있게 봤습니다. 추천" },
                { author: "prty", score: 10, text: "미스터 로봇 미니시리즈 보다 좋았습니다. 추천" }
            ],
            trailerYoutubeId: 'pWqnW99J1fg'
        },
        {
            id: 5,
            title: "A Working Man",
            originalTitle: "워킹맨",
            poster: "https://resizing.flixster.com/U3a02XV8zbgQIaC_-pRy7I3eOMI=/206x305/v2/https://resizing.flixster.com/O2tVkJKLzSO9FvArgeUcldAXWws=/ems.cHJkLWVtcy1hc3NldHMvbW92aWVzL2UxNjAwMTY2LTRkMjMtNGM0Zi05MTY2LTNiNmYxNTQyOTkyMi5qcGc=",
            reviewer: "5/10",
            audience: "8.5/10",
            releaseDate: "2025-03-28",
            description: "평범한 직장인의 비범한 일상",
            genres: ["코미디", "드라마"],
            runtime: "98분",
            directors: ["로버트 쥬리"],
            actors: ["제이슨 베이트만", "레슬리 만", "존 시나"],
            reviews: [
                { author: "직장인", score: 9, text: "공감되는 이야기" },
                { author: "영화팬", score: 8, text: "소소한 웃음이 있는 작품" }
            ],
            trailerYoutubeId: 'PWZhqp2bUQc'
        },
        {
            id: 6,
            title: "Death of a Unicorn",
            originalTitle: "유니콘의 죽음",
            poster: "https://resizing.flixster.com/0nK4RvUzFBsCOof1PGK7S7DSJlg=/206x305/v2/https://resizing.flixster.com/0hgK9M6-0k3v5wwaOYkpIjt1WmI=/ems.cHJkLWVtcy1hc3NldHMvbW92aWVzLzQxZGMzNzA5LWQ3YzQtNGY2NS05YTM2LTQzYTI2YTdjMTQ4Yi5qcGc=",
            reviewer: "5/10",
            audience: "7.5/10",
            releaseDate: "2025-03-28",
            description: "판타지와 현실의 경계를 넘나드는 영화",
            genres: ["판타지", "드라마"],
            runtime: "112분",
            directors: ["소피아 코폴라"],
            actors: ["브리 라슨", "폴 머스카트", "데브라 윈거"],
            reviews: [
                { author: "판타지덕", score: 7, text: "독특한 세계관과 연출" },
                { author: "영화광", score: 6, text: "기대보다는 조금 아쉬웠습니다." }
            ],
            trailerYoutubeId: 'GLPidvASFUw'
        },
        {
            id: 7,
            title: "Mission: Impossible – Final Reckoning",
            originalTitle: "미션 임파서블: 파이널 레코닝",
            poster: "https://www.kobis.or.kr/common/mast/movie/2025/05/cadaf5d0c83644558ce8115e0606afe1.jpg",
            reviewer: "8.2/10",
            audience: "9.1/10",
            releaseDate: "2025-05-17",
            description: "에단 헌트가 새로운 위협에 맞서는 액션 블록버스터",
            genres: ["액션", "스릴러"],
            runtime: "169분",
            directors: ["크리스토퍼 맥쿼리"],
            actors: ["톰 크루즈", "헤일리 앳웰", "사이먼 페그"],
            trailerYoutubeId: 'vuOKO1LSIG8'
        },

        // 릴로 & 스티치
        {
            id: 8,
            title: "Lilo & Stitch",
            originalTitle: "릴로 & 스티치",
            poster: "https://www.kobis.or.kr/common/mast/movie/2025/05/ea86eb7c7bc8454882636bf899464fe1.jpg",
            reviewer: "7.5/10",
            audience: "8.8/10",
            releaseDate: "2025-05-21",
            description: "하와이 소녀 릴로와 외계 생명체 스티치의 우정과 모험",
            genres: ["모험", "코미디", "가족"],
            runtime: "108분",
            directors: ["딘 플라이셔 캠프"],
            actors: ["마이아 케알로하", "크리스 샌더스", "빌리 매그너슨"],
            trailerYoutubeId: 'AysHcD6nGc8'
        },

        // 탑건 매버릭
        {
            id: 9,
            title: "Top Gun: Maverick",
            originalTitle: "탑건: 매버릭",
            poster: "https://www.kobis.or.kr/common/mast/movie/2022/06/fa28d4efd4ed492f86cd892ed31913e1.jpg",
            reviewer: "9.0/10",
            audience: "9.5/10",
            releaseDate: "2022-06-22",
            description: "전설의 파일럿 매버릭의 귀환과 새로운 도전",
            genres: ["액션", "드라마"],
            runtime: "131분",
            directors: ["조셉 코신스키"],
            actors: ["톰 크루즈", "마일스 텔러", "제니퍼 코넬리"],
            trailerYoutubeId: 'Mrj9XACVJ8U'
        },

        // 썬더볼츠
        {
            id: 10,
            title: "Thunderbolts",
            originalTitle: "썬더볼츠",
            poster: "https://www.kobis.or.kr/common/mast/movie/2025/04/410defe99f34425ea23c54dcdaaef307.jpg",
            reviewer: "7.2/10",
            audience: "8.0/10",
            releaseDate: "2025-07-25",
            description: "마블의 새로운 팀업, 썬더볼츠의 활약",
            genres: ["액션", "SF"],
            runtime: "120분",
            directors: ["제이크 슈라이어"],
            actors: ["플로렌스 퓨", "세바스찬 스탠", "와이어트 러셀"],
            trailerYoutubeId: '4txrPwjxSRI'
        },

        // 캡틴 아메리카: 브레이브 뉴 월드
        {
            id: 11,
            title: "Captain America: Brave New World",
            originalTitle: "캡틴 아메리카: 브레이브 뉴 월드",
            poster: "https://www.kobis.or.kr/common/mast/movie/2025/02/fcef6ef049824f90bfa9f6858a6544ae.jpg",
            reviewer: "8.0/10",
            audience: "8.7/10",
            releaseDate: "2025-08-15",
            description: "새로운 캡틴 아메리카의 시대를 여는 마블의 신작",
            genres: ["액션", "SF"],
            runtime: "135분",
            directors: ["줄리어스 오나"],
            actors: ["앤서니 매키", "해리슨 포드", "리브 타일러"],
            trailerYoutubeId: 'EPdzdAK3YJ8'
        }
        
    ]
    
};

// // 영화 데이터 로드
// function loadMovies() {
//     const moviesGrid = document.getElementById('moviesGrid');
//     moviesGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>영화 정보를 불러오는 중...</p></div>';
    
//     // 비동기 작업 시뮬레이션 (실제로는 서버 API 호출)
//     setTimeout(() => {
//         let html = '';
        
//         movieData.movies.forEach(movie => {
//             const tomatoClass = parseInt(movie.reviewer) > 75 ? 'gold' : '';
            
//             html += `
//                 <div class="movie-card" data-id="${movie.id}">
//                     <div class="poster-container">
//                         <img src="${movie.poster}" alt="${movie.title}">
//                         <div class="play-button">
//                             <i class="fas fa-play"></i>
//                         </div>
//                     </div>
//                     <div class="movie-info">
//                         <div class="ratings">
//                             <span class="reviewer ${tomatoClass}">${movie.reviewer}</span>
//                             <span class="audience">${movie.audience}</span>
//                         </div>
//                         <h3 class="movie-title">${movie.title}</h3>
//                         <p class="movie-date">개봉일: ${formatDate(movie.releaseDate)}</p>
//                         <button class="watchlist-btn">WATCHLIST</button>
//                     </div>
//                 </div>
//             `;
//         });
        
//         moviesGrid.innerHTML = html;
        
//         // 영화 카드 클릭 이벤트
//         const movieCards = document.querySelectorAll('.movie-card');
//         movieCards.forEach(card => {
//             card.addEventListener('click', function() {
//                 const movieId = this.getAttribute('data-id');
//                 showMovieDetail(movieId);
//             });
//         });
        
//          // [여기에 추가] 플레이버튼 클릭 이벤트
//         document.querySelectorAll('.play-button').forEach(btn => {
//             btn.addEventListener('click', function(e) {
//                 e.stopPropagation(); // 카드 클릭 방지
//                 const card = btn.closest('.movie-card');
//                 const movieId = card.getAttribute('data-id');
//                 const movie = movieData.movies.find(m => m.id == movieId);
//                 if (movie && movie.trailerYoutubeId) {
//                     openTrailerModal(movie.trailerYoutubeId);
//                 } else {
//                     alert('예고편 정보가 없습니다.');
//                 }
//             });
//         });
        
//     }, 1000); // 1초 지연 (로딩 시뮬레이션)
// }

function openTrailerModal(youtubeId) {
    // 모달 생성 및 유튜브 iframe 삽입
    let modal = document.getElementById('trailerModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'trailerModal';
      modal.className = 'modal show';
      modal.innerHTML = `
        <div class="modal-content" style="max-width:640px">
          <span class="close-modal" id="closeTrailerModal">&times;</span>
          <div id="trailerContainer"></div>
        </div>
      `;
      document.body.appendChild(modal);
      document.getElementById('closeTrailerModal').onclick = function() {
        modal.classList.remove('show');
        document.getElementById('trailerContainer').innerHTML = '';
      };
      modal.onclick = function(e) {
        if (e.target === modal) {
          modal.classList.remove('show');
          document.getElementById('trailerContainer').innerHTML = '';
        }
      };
    } else {
      modal.classList.add('show');
    }
    document.getElementById('trailerContainer').innerHTML = `
      <iframe width="560" height="315"
        src="https://www.youtube.com/embed/${youtubeId}?autoplay=1"
        frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
      </iframe>
    `;
  }
// function showMovieDetail(movieId) {
//     const movieDetailContent = document.getElementById('movieDetailContent');
//     movieDetailContent.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>영화 상세정보를 불러오는 중...</p></div>';

//     // 상세 페이지로 전환
//     switchPage('movie-detail');

//     // 영화 데이터 조회
//     const movie = movieData.movies.find(m => m.id == movieId);
//     if (!movie) {
//         movieDetailContent.innerHTML = '<p>영화 정보를 찾을 수 없습니다.</p>';
//         return;
//     }

//     // [중요] 현재 영화 제목을 전역 변수에 저장 (댓글 등록/조회 API 연동에 필수!)
//     window.currentMovieTitle = movie.title;

//     // 총평 계산 함수
//     function getTotalScore(audience, reviewer) {
//         function parseScore(score) {
//             if (typeof score === 'string') {
//                 const match = score.match(/([\d.]+)/);
//                 return match ? parseFloat(match[1]) : 0;
//             }
//             return Number(score) || 0;
//         }
//         const a = parseScore(audience);
//         const r = parseScore(reviewer);
//         const total = (a * 0.7 + r * 0.3).toFixed(1);
//         return `${total}/10`;
//     }

//     setTimeout(() => {
//         let html = `
//             <div class="movie-detail-banner" style="background-image: url('https://via.placeholder.com/1200x400?text=${encodeURIComponent(movie.title)}')">
//                 <div class="banner-overlay">
//                     <div class="movie-detail-content">
//                         <div class="movie-poster-large">
//                             <img src="${movie.poster}" alt="${movie.title}">
//                         </div>
//                         <div class="movie-detail-info">
//                             <h1 class="movie-detail-title">${movie.title}</h1>
//                             <p class="movie-detail-original">${movie.originalTitle}</p>
//                             <div class="movie-detail-meta">
//                                 <p><strong>장르:</strong> ${movie.genres.join(', ')}</p>
//                                 <p><strong>감독:</strong> ${movie.directors.join(', ')}</p>
//                                 <p><strong>출연:</strong> ${movie.actors.join(', ')}</p>
//                                 <p><strong>상영시간:</strong> ${movie.runtime}</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <div class="movie-stats">
//                 <div class="stat-group">
//                     <div class="stat-item">
//                         <span class="stat-value">${movie.audience}</span>
//                         <span class="stat-label">관객평</span>
//                     </div>
//                     <div class="stat-item">
//                         <span class="stat-value">${movie.reviewer}</span>
//                         <span class="stat-label">평론평</span>
//                     </div>
//                     <div class="stat-item">
//                         <span class="stat-value">${getTotalScore(movie.audience, movie.reviewer)}</span>
//                         <span class="stat-label">총평</span>
//                     </div>
//                 </div>
//             </div>
//             <div class="movie-tabs">
//                 <button class="tab-btn">실관람평</button>
//             </div>
//             <div class="reviews-container">
//                 <h3 id="reviewTitle">${movie.title}에 대한 <span id="commentCount">0</span>개의 이야기가 있어요!</h3>
//                 <!-- 댓글 리스트 영역 -->
//                 <div class="comments-list" id="commentsList"></div>
//                 <!-- 댓글 작성 영역(이미 index.html에 있음) -->
//             </div>
//         `;

//         movieDetailContent.innerHTML = html;

//         // 탭 버튼 이벤트 리스너
//         const tabButtons = document.querySelectorAll('.tab-btn');
//         tabButtons.forEach(button => {
//             button.addEventListener('click', function() {
//                 tabButtons.forEach(btn => btn.classList.remove('active'));
//                 this.classList.add('active');
//                 // 탭 콘텐츠 전환 로직 (구현 필요)
//             });
//         });

//         // [중요] DB에서 댓글(리뷰) 불러오기
//         loadComments(movie.title);

//     }, 1200); // 1.2초 지연
// }


// 날짜 포맷팅 (YYYY-MM-DD -> YYYY년 MM월 DD일)
function formatDate(dateString) {
    if (!dateString) return '';
    
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    
    return `${year}년 ${month}월 ${day}일`;
}

// 숫자 포맷팅 (천 단위 구분)
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 리뷰 불러오기
function loadReviews(movieTitle) {
    fetch(`/api/reviews?movie_title=${encodeURIComponent(movieTitle)}`)
      .then(res => res.json())
        .then(reviews => {
        // 리뷰 목록 렌더링
      });
  }
  
  // 리뷰 저장
function submitReview(movieTitle, userId, rating, content) {
    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movie_title: movieTitle, user_id: userId, rating, content })
    })
    .then(res => res.json())
    .then(result => {
      loadReviews(movieTitle);
    });
}
  

//  // 예시: 리뷰 불러오기 함수
// function loadReviews(movieTitle) {
//     fetch('/api/reviews?movie_title=' + encodeURIComponent(movieTitle))
//       .then(res => res.json())
//       .then(reviews => {
//         // 리뷰 목록을 화면에 렌더링
        
//       });
//   }

//   // 예시: 리뷰 작성 함수
// function submitReview(movieTitle, userId, rating, content) {
//     fetch('/api/reviews', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         movie_title: movieTitle,
//         user_id: userId,
//         rating,
//         content
//       })
//     })
//     .then(res => res.json())
//     .then(result => {
//     //   alert('리뷰가 저장되었습니다!');
//       // 저장 후 리뷰 목록 다시 불러오기
//       loadReviews(movieTitle);
//     })
//     // .catch(err => alert('리뷰 저장 실패: ' + err));
//   }