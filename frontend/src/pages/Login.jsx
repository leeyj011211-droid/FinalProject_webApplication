import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // 1. 카카오 로그인 핸들러 (기존 유지)
  const handleKakaoLogin = () => {
    window.location.href = 'http://localhost:8000/auth/kakao/login';
  };

  // 2. 구글 로그인 콜백 핸들러 (새로 추가)
  const handleGoogleCallback = async (response) => {
    try {
      console.log("구글 토큰 수신:", response.credential);

      // 백엔드로 구글 토큰 전송 -> 세션 생성 요청
      const res = await fetch('http://localhost:8000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential }),
        credentials: 'include' // 세션 쿠키 생성 필수
      });

      if (res.ok) {
        const data = await res.json();
        // Context 업데이트 및 대시보드 이동
        login(data.user);
        navigate('/dashboard');
      } else {
        alert("구글 로그인 실패 (서버 응답 오류)");
      }
    } catch (e) {
      console.error("구글 로그인 에러:", e);
      alert("로그인 처리 중 오류가 발생했습니다.");
    }
  };

  // 3. 구글 버튼 렌더링 (스크립트 로드)
  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => {
        // 구글 로그인 초기화
        window.google.accounts.id.initialize({
          // ★ 본인의 구글 클라이언트 ID로 교체 필요 ★
          client_id: "121207632304-46j66kom4rbshbe11dgelog8ge9b4f4p.apps.googleusercontent.com", 
          callback: handleGoogleCallback
        });

        // 버튼 그리기
        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInDiv'),
          { theme: 'outline', size: 'large', width: '100%', text: 'continue_with' }
        );
      };
      document.body.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  return (
    <div className="login-page" style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        justifyContent: 'center', height: '100%', padding: '20px', 
        background: '#f8f9fa' 
    }}>
      {/* 로고 영역 */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🚗</div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>Road Guardian</h1>
        <p style={{ color: '#666', fontSize: '14px' }}>도로교통법 전문<br/>AI 챗봇</p>
      </div>

      {/* 로그인 버튼 영역 */}
      <div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* 카카오 버튼 */}
        <button 
          onClick={handleKakaoLogin}
          style={{
            width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
            background: '#FEE500', color: '#000000', fontWeight: '600',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <span>💬</span> 카카오로 로그인
        </button>

        {/* 구글 버튼 (스크립트가 여기에 버튼을 만듦) */}
        <div id="googleSignInDiv" style={{ width: '100%' }}></div>

      </div>

      <div style={{ marginTop: '40px', fontSize: '12px', color: '#999', textAlign: 'center' }}>
        <span style={{ color: '#00b894', fontWeight: 'bold' }}>● 보안 연결</span>
        <br/><br/>
        로그인하면 신고 관리, AI 법률 상담을<br/>한 계정으로 이용할 수 있습니다.
      </div>
    </div>
  );
};

export default Login;