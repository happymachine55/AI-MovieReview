// Supabase 설정
const SUPABASE_CONFIG = {
    url: 'https://iwdivytuvwlpvzfnbigs.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3ZGl2eXR1dndscHZ6Zm5iaWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwMzI2ODIsImV4cCI6MjA0NzYwODY4Mn0.ey3hbGc1OiJJIUziN1IzInR5cCI6IkpXVCJ9.ey3pc3M1OiJzdXBhYmFzZSIsInJlZiI6Iml3ZGl2eXR1dndscHZ6Zm5iaWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwMzI2ODIsImV4cCI6MjA0NzYwODY4Mn0'
};

// API 기본 URL
const API_BASE_URL = `${SUPABASE_CONFIG.url}/functions/v1`;

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
