// Supabase 설정 (프로덕션용)
const SUPABASE_CONFIG = {
    url: 'https://iwdivytuvwlpvzfnbigs.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3ZGl2eXR1dndscHZ6Zm5iaWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTU1NTAsImV4cCI6MjA3ODkzMTU1MH0.v6ewZZhPEnnzGjcgqH0SVGgYGqAFg4ZGIsZ4Rjx0a9c'
};

// Supabase 클라이언트 초기화
const supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// 🔧 개발 환경: 로컬 Express 서버 사용
const USE_LOCAL_API = false;

// API 기본 URL
const API_BASE_URL = USE_LOCAL_API ? '/api' : `${SUPABASE_CONFIG.url}/functions/v1`;

// API 엔드포인트
const API = {
    me: `${API_BASE_URL}/me`,
    login: `${API_BASE_URL}/login`,
    register: `${API_BASE_URL}/register`,
    logout: `${API_BASE_URL}/logout`,
    posts: `${API_BASE_URL}/posts`,
    reviews: `${API_BASE_URL}/reviews`,
    comments: `${API_BASE_URL}/comments`,
    feedbacks: `${API_BASE_URL}/feedbacks`,
    aiReview: `${API_BASE_URL}/ai-review`,
    likes: `${API_BASE_URL}/likes`
};

// 로컬 세션 스토리지 키
const STORAGE_KEYS = {
    userId: 'supabase_user_id',
    username: 'supabase_username'
};

// 세션 관리 헬퍼 함수
const Session = {
    getUserId: () => localStorage.getItem(STORAGE_KEYS.userId),
    getUsername: () => localStorage.getItem(STORAGE_KEYS.username),
    setUser: (userId, username) => {
        localStorage.setItem(STORAGE_KEYS.userId, userId);
        localStorage.setItem(STORAGE_KEYS.username, username);
    },
    clear: () => {
        localStorage.removeItem(STORAGE_KEYS.userId);
        localStorage.removeItem(STORAGE_KEYS.username);
    },
    isLoggedIn: () => !!Session.getUserId()
};

// Supabase Functions 호출용 헤더 생성 헬퍼
function getSupabaseHeaders(includeAuth = false) {
    const headers = {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_CONFIG.anonKey
    };
    
    if (includeAuth) {
        headers['Authorization'] = `Bearer ${SUPABASE_CONFIG.anonKey}`;
    }
    
    return headers;
}
