import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 주소와 비교해서 색깔 칠하기 (활성화)
  const isActive = (path) => {
    // /dashboard가 기본 홈이므로, 루트(/)일 때도 홈 버튼 활성화
    if (path === '/dashboard' && location.pathname === '/') return 'active';
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="bottom-nav">
      {/* 1. 홈 */}
      <div className={`nav-item ${isActive('/dashboard')}`} onClick={() => navigate('/dashboard')}>
        <div className="nav-icon">🏠</div><span>홈</span>
      </div>
      
      {/* 2. 신고 */}
      <div className={`nav-item ${isActive('/report')}`} onClick={() => navigate('/report')}>
        <div className="nav-icon">📋</div><span>신고</span>
      </div>
      
      {/* 3. 상담 */}
      <div className={`nav-item ${isActive('/chatbot')}`} onClick={() => navigate('/chatbot')}>
        <div className="nav-icon">💬</div><span>상담</span>
      </div>

      {/* 4. 정보 (추가됨) */}
      <div className={`nav-item ${isActive('/about')}`} onClick={() => navigate('/about')}>
        <div className="nav-icon">ℹ️</div><span>정보</span>
      </div>

      {/* 5. 지원 (추가됨) */}
      <div className={`nav-item ${isActive('/support')}`} onClick={() => navigate('/support')}>
        <div className="nav-icon">🆘</div><span>지원</span>
      </div>
    </div>
  );
};

export default BottomNav;