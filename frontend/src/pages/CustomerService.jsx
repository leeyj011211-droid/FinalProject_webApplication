import React, { useState, useRef, useEffect } from 'react';


const CustomerService = () => {
  // 초기 메시지
  const [messages, setMessages] = useState([
    { 
      text: "👋 안녕하세요! 저는 대한민국 도로교통법 전문 AI 챗봇입니다.\n\n신호 위반, 중앙선 침범 등 궁금한 점을 무엇이든 물어보세요!", 
      isUser: false 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false); // 질문 예시 표시 여부
  const messagesEndRef = useRef(null);

  // 메시지가 추가될 때마다 스크롤 하단으로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (overrideInput = null) => {
    const messageToSend = overrideInput || input;
    if (!messageToSend.trim() || isLoading) return;
    
    // 사용자 메시지 화면에 추가
    const newMessages = [...messages, { text: messageToSend, isUser: true }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setShowSuggestions(false); // 메시지 전송 시 예시 숨김

    try {
      const res = await fetch('http://localhost:8000/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: messageToSend })
      });
      
      const data = await res.json();
      
      // AI 답변 추가
      setMessages([...newMessages, { text: data.answer, isUser: false }]);
    } catch (e) {
      console.error("AI 요청 실패:", e);
      setMessages([
        ...newMessages, 
        { 
          text: "죄송합니다. AI 서버(8000번)와 연결할 수 없습니다.\n파이썬 서버가 켜져 있는지 확인해주세요.", 
          isUser: false 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (question) => {
    sendMessage(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="screen active" style={{display:'flex', flexDirection:'column', height:'100%'}}>
      <div className="header">
        <h1>💬 도로법 전문 상담</h1>
        <p>AI 챗봇과 실시간 대화</p>
      </div>
      
      <div className="chatbot-container">
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.isUser ? 'user' : ''}`}>
              <div className={`chat-bubble ${msg.isUser ? 'user' : 'assistant'}`}>
                {msg.text.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i !== msg.text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="chat-message">
              <div className="chat-bubble assistant" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                padding: '12px 16px'
              }}>
                <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  답변 생성 중...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* 질문 예시 토글 버튼 */}
        <div style={{ 
          padding: '12px 20px', 
          borderTop: '1px solid var(--border-light)',
          background: 'var(--bg-secondary)'
        }}>
          <button 
            onClick={() => setShowSuggestions(!showSuggestions)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
          >
            <span>{showSuggestions ? '📁' : '💡'}</span>
            <span>{showSuggestions ? '질문 예시 숨기기' : '질문 예시 보기'}</span>
            <span style={{ 
              marginLeft: 'auto',
              transform: showSuggestions ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.3s ease'
            }}>
              ▼
            </span>
          </button>
        </div>

        {/* 질문 예시 (조건부 렌더링) */}
        {showSuggestions && (
          <div className="suggestions-container" style={{ 
            animation: 'slideDown 0.3s ease',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            <button 
              className="suggestion-btn" 
              onClick={() => handleSuggestion('신호 위반 벌금은 얼마인가요?')}
              disabled={isLoading}
            >
              🚦 신호 위반 벌금은?
            </button>
            <button 
              className="suggestion-btn" 
              onClick={() => handleSuggestion('중앙선 침범 처벌은?')}
              disabled={isLoading}
            >
              🟡 중앙선 침범 처벌은?
            </button>
            <button 
              className="suggestion-btn" 
              onClick={() => handleSuggestion('음주운전 기준과 처벌')}
              disabled={isLoading}
            >
              🍺 음주운전 처벌은?
            </button>
          </div>
        )}
        
        <div className="chat-input-area">
          <textarea 
            className="chat-input-field" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="질문을 입력하세요..."
            rows={1}
            disabled={isLoading}
          />
          <button 
            className="chat-send-btn" 
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            style={{
              opacity: isLoading || !input.trim() ? 0.5 : 1,
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
      </div>

      <style>{`
        .suggestion-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CustomerService;
