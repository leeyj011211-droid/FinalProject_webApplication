import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(async () => {
        try {
            const res = await fetch('/api/logs'); 
            const data = await res.json();
            setLogs(data);
        } catch (e) { console.error(e); }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentDate = () => {
    const now = new Date();
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]}요일`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침입니다';
    if (hour < 18) return '좋은 오후입니다';
    return '좋은 저녁입니다';
  };

  return (
    <div className="screen active">
      <div className="header">
        <h1>{getGreeting()} 👋</h1>
        <p>{getCurrentDate()}</p>
      </div>

      {/* 상단 통계 요약 */}
      <div className="stats-container" style={{ padding: '20px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', margin: '20px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: '700', color: '#2563EB' }}>{logs.length}</div><div style={{ fontSize: '12px' }}>신고 접수</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>8</div><div style={{ fontSize: '12px' }}>처리 완료</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: '700', color: '#F59E0B' }}>2</div><div style={{ fontSize: '12px' }}>진행 중</div></div>
        </div>
      </div>

      {/* 빠른 메뉴 */}
      <div style={{ padding: '0 20px' }}>
        <h3 style={{ marginBottom: '30px', fontSize: '20px' }}>빠른 메뉴</h3>
        
        <div className="quick-menu-wrapper">
          <div className="menu-card quick-box" onClick={() => navigate('/report')}>
            <div className="menu-icon">📝</div>
            <div className="menu-content">
              <div className="menu-title">신고 작성</div>
              <div className="menu-desc">AI 자동 작성</div>
            </div>
          </div>

          <div className="menu-card quick-box" onClick={() => navigate('/chatbot')}>
            <div className="menu-icon">💬</div>
            <div className="menu-content">
              <div className="menu-title">법률 상담</div>
              <div className="menu-desc">AI 챗봇 대화</div>
            </div>
          </div>

          <div className="menu-card quick-box" onClick={() => navigate('/about')}>
            <div className="menu-icon">📋</div>
            <div className="menu-content">
              <div className="menu-title">신고 기록</div>
              <div className="menu-desc">이력 조회</div>
            </div>
          </div>

          <div className="menu-card quick-box" onClick={() => navigate('/support')}>
            <div className="menu-icon">👤</div>
            <div className="menu-content">
              <div className="menu-title">마이페이지</div>
              <div className="menu-desc">설정 관리</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;