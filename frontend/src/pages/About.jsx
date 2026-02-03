import React from 'react';

const About = () => {
  return (
    <div className="screen active">
      <div className="header">
        <h1>ℹ️ 정보</h1>
        <p>Road Guardian</p>
      </div>

      <div style={{ padding: '16px' }}>
        {/* 주요 기능 카드 */}
        <div className="analytics-card" style={{ background: 'linear-gradient(135deg, var(--primary-light) 0%, #F0F9FF 100%)' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
            🚀 주요 기능
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            도로교통법 전문 AI 챗봇. RAG 기반 정확한 법률 정보 제공과 LLM을 활용한 지능형 신고 시스템.
          </div>
        </div>

        {/* 특징 카드 */}
        <div className="analytics-card" style={{ background: 'linear-gradient(135deg, #DCFCE7 0%, #F0FDF4 100%)' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--success-green)', marginBottom: '8px' }}>
            ✨ 특징
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            1. 도로교통법 전문 AI 상담<br />
            2. RAG 기반 정확한 정보<br />
            3. 실시간 신고 시스템<br />
            4. 자동 위치 기록 및 분석
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;