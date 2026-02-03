import React, { useState } from 'react';

const CustomerService = () => {
  // 1. 초기 메시지
  const [messages, setMessages] = useState([
    { 
      text: "👋 안녕하세요! 저는 대한민국 도로교통법 전문 AI 챗봇입니다.\n\n신호 위반, 중앙선 침범 등 궁금한 점을 물어보세요!", 
      isUser: false 
    }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async (overrideInput = null) => {
    const messageToSend = overrideInput || input;
    if (!messageToSend.trim()) return;
    
    // 사용자 메시지 화면에 추가
    const newMessages = [...messages, { text: messageToSend, isUser: true }];
    setMessages(newMessages);
    setInput("");

    try {
      // ★ 핵심 수정: 자바(8080) 대신 파이썬(8000) AI 서버로 직접 요청 ★
      // 원본 index.html의 로직(/api/ask)을 그대로 따름
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
      setMessages([...newMessages, { text: "죄송합니다. AI 서버(8000번)와 연결할 수 없습니다.\n파이썬 서버가 켜져 있는지 확인해주세요.", isUser: false }]);
    }
  };

  const handleSuggestion = (question) => {
    sendMessage(question);
  };

  return (
    <div className="screen active" style={{display:'flex', flexDirection:'column', height:'100%'}}>
      <div className="header">
        <h1>💬 도로법 전문 상담</h1>
        <p>AI 챗봇과 대화하기</p>
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
        </div>
        
        <div className="suggestions-container">
            <button 
              className="suggestion-btn" 
              onClick={() => handleSuggestion('신호 위반 벌금은 얼마인가요?')}
            >
              🚦 신호 위반 벌금
            </button>
            <button 
              className="suggestion-btn" 
              onClick={() => handleSuggestion('중앙선 침범 처벌은?')}
            >
              🟡 중앙선 침범
            </button>
        </div>
        
        <div className="chat-input-area">
          <textarea 
            className="chat-input-field" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
            placeholder="질문을 입력하세요..."
            rows={1}
          />
          <button className="chat-send-btn" onClick={() => sendMessage()}>📤</button>
        </div>
      </div>
    </div>
  );
};

export default CustomerService;