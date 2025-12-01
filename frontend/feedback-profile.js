// ========================================================
// 💬 피드백 기능
// ========================================================

// 피드백 모달 열기/닫기
function openFeedbackModal() {
    if (!Session.isLoggedIn()) {
        alert('로그인이 필요한 기능입니다.');
        return;
    }
    document.getElementById('feedbackModal').style.display = 'block';
    loadMyFeedbacks();
}

function closeFeedbackModal() {
    document.getElementById('feedbackModal').style.display = 'none';
    document.getElementById('feedback-content').value = '';
}

// 피드백 제출
async function submitFeedback() {
    const content = document.getElementById('feedback-content').value.trim();
    
    if (!content) {
        alert('피드백 내용을 입력해주세요.');
        return;
    }
    
    if (!Session.getUserId()) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    try {
        // Supabase에 직접 insert (Edge Function 대신)
        const { data, error } = await supabase
            .from('feedbacks')
            .insert({
                user_id: parseInt(Session.getUserId()),
                content: content
            })
            .select()
            .single();
        
        if (error) {
            throw error;
        }
        
        alert('피드백이 제출되었습니다. 감사합니다!');
        document.getElementById('feedback-content').value = '';
        loadMyFeedbacks();
    } catch (error) {
        console.error('피드백 제출 오류:', error);
        alert('피드백 제출 실패: ' + error.message);
    }
}

// 내 피드백 목록 불러오기
async function loadMyFeedbacks() {
    const userId = Session.getUserId();
    if (!userId) return;
    
    const feedbackList = document.getElementById('feedback-list');
    feedbackList.innerHTML = '<p style="text-align:center;color:#999;">로딩 중...</p>';
    
    try {
        // Supabase에서 직접 조회 (Edge Function 대신)
        const { data: feedbacks, error } = await supabase
            .from('feedbacks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) {
            throw new Error(error.message || '피드백 로드 실패');
        }
        
        if (feedbacks.length === 0) {
            feedbackList.innerHTML = '<p style="text-align:center;color:#999;">작성한 피드백이 없습니다.</p>';
            return;
        }
        
        feedbackList.innerHTML = '';
        feedbacks.forEach(feedback => {
            const feedbackItem = document.createElement('div');
            feedbackItem.style.cssText = 'padding:15px;background:#f9f9f9;border-radius:4px;margin-bottom:10px;';
            
            const date = new Date(feedback.created_at).toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            feedbackItem.innerHTML = `
                <div style="font-size:12px;color:#999;margin-bottom:8px;">${date}</div>
                <div style="color:#333;line-height:1.6;">${feedback.content}</div>
            `;
            
            feedbackList.appendChild(feedbackItem);
        });
    } catch (error) {
        console.error('피드백 로드 오류:', error);
        feedbackList.innerHTML = '<p style="text-align:center;color:#d9230f;">피드백을 불러올 수 없습니다.</p>';
    }
}

// ========================================================
// 📸 프로필 이미지 관련 함수
// ========================================================

// 프로필 이미지 표시 (로그인 시)
function displayProfileImage(profileImageUrl) {
    const profileImg = document.getElementById('profile-img');
    if (profileImageUrl && profileImageUrl.trim() !== '') {
        profileImg.src = profileImageUrl;
        profileImg.style.display = 'inline-block';
    } else {
        profileImg.style.display = 'none';
    }
}

// 프로필 이미지 업로드 (회원가입 시)
async function uploadProfileImage(file, userId = null) {
    if (!file) return null;

    // 파일 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB 이하여야 합니다.');
        return null;
    }

    // 파일 형식 체크
    if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return null;
    }

    try {
        // Supabase Storage에 업로드
        const bucket = 'profiles';
        
        // 회원가입 시에는 userId가 없으므로 임시 경로 사용
        const userPath = userId || `temp_${Date.now()}`;
        
        // 고유 파일 경로 구성: profiles/{userId}/profile_{timestamp}.{ext}
        const ext = file.type.includes('png') ? 'png' : (file.type.includes('jpeg') ? 'jpg' : 'webp');
        const path = `${userPath}/profile_${Date.now()}.${ext}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                contentType: file.type,
                upsert: true
            });

        if (error) {
            console.error('Storage 업로드 오류:', error);
            alert('이미지 업로드 실패: ' + (error.message || '알 수 없는 오류'));
            return null;
        }

        // 퍼블릭 URL 가져오기
        const { data: publicUrlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);

        const publicUrl = publicUrlData?.publicUrl || null;

        if (!publicUrl) {
            alert('이미지 URL 생성 실패');
            return null;
        }

        // 로컬 저장 및 UI 반영을 위해 URL 반환
        return publicUrl;
    } catch (error) {
        console.error('이미지 업로드 오류:', error);
        alert('이미지 업로드 실패: ' + error.message);
        return null;
    }
}
