import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const Report = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  
  // 선택된 신고 ID (PC용)
  const [selectedReportId, setSelectedReportId] = useState(null);
  
  // 초기 상태 로드
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem('myReports');
    const parsed = saved ? JSON.parse(saved) : [
      {
        id: 1,
        title: '신호 위반',
        date: '2026-02-12 14:32',
        plate: '12가 3456',
        status: 'complete',
        desc: '적색 신호에 교차로 진입함.',
        detailContent: '[AI 자동 생성 초안]\n\n위반 행위: 신호 위반\n차량 번호: 12가 3456\n발생 일시: 2026-02-12 14:32\n\n상세 내용:\n해당 차량이 적색 신호에 교차로 진입함 행위를 하는 것을 목격하였습니다.\n영상 증거를 첨부하오니 확인 부탁드립니다.\n\n※ 위 내용은 AI가 자동으로 작성한 초안입니다. 수정 후 제출해주세요.'
      }
    ];

    return parsed.map(item => {
        if (item.status === 'processing') {
            return {
                ...item,
                status: 'error',
                progressMsg: '분석 중단됨 (재시도 필요)',
                title: '분석 취소됨'
            };
        }
        return item;
    });
  });

  // PC인지 확인
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 상태 변경 시 로컬 스토리지 저장
  useEffect(() => {
    localStorage.setItem('myReports', JSON.stringify(reports));
  }, [reports]);

  // 삭제 기능
  const deleteReport = (e, id) => {
    e.stopPropagation();
    if (window.confirm('이 신고 내역을 삭제하시겠습니까?')) {
      setReports(prev => prev.filter(item => item.id !== id));
      if (selectedReportId === id) {
        setSelectedReportId(null);
      }
    }
  };

  // 아이템 상태 업데이트 헬퍼
  const updateItemStatus = (id, newStatus, message, finalData = null) => {
    setReports(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus,
          progressMsg: message,
          ...finalData
        };
      }
      return item;
    }));
  };

  const processVideoAnalysis = async (id, file) => {
    updateItemStatus(id, 'processing', 'AI가 영상을 정밀 분석 중입니다...');

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch('http://localhost:8000/api/analyze-video', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        
        console.log("📦 Report.jsx - 서버 응답 전체:", data);
        console.log("📝 ai_report 필드:", data.ai_report);
        
        const violationTitle = data.result ? data.result.split('(')[0].trim() : '위반 감지';

        setReports(prev => prev.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    status: 'complete',
                    title: violationTitle,
                    plate: data.plate || '식별불가',
                    date: data.time,
                    time: data.time,
                    desc: data.result,
                    detailContent: data.ai_report || '초안 생성 실패',
                    videoSrc: URL.createObjectURL(file)
                };
            }
            return item;
        }));

        // PC에서는 자동으로 선택
        if (isDesktop) {
          setSelectedReportId(id);
        }
        
      } else {
        throw new Error("서버 에러 응답");
      }

    } catch (error) {
      console.error("분석 실패:", error);
      updateItemStatus(id, 'error', '서버 연결 실패');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const newId = Date.now();
    
    const newReport = {
      id: newId,
      title: '영상 분석 중...',
      date: new Date().toLocaleString(),
      plate: '-',
      status: 'processing', 
      progressMsg: '서버 연결 대기 중...',
      videoSrc: null
    };

    setReports([newReport, ...reports]); 
    processVideoAnalysis(newId, file);
    
    e.target.value = ''; 
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // 신고 항목 클릭 핸들러
  const handleReportClick = (report) => {
    if (report.status !== 'complete') return;
    
    if (isDesktop) {
      // PC: 오른쪽에 상세보기 표시
      setSelectedReportId(report.id);
    } else {
      // 모바일: 페이지 이동
      navigate('/report/detail', { state: report });
    }
  };

  // 선택된 신고 찾기
  const selectedReport = reports.find(r => r.id === selectedReportId);

  // Detail 컴포넌트 (PC용 인라인)
  const ReportDetailCard = ({ report, onClose }) => {
    const [detailContent, setDetailContent] = useState(report.detailContent || '');
    const [showModal, setShowModal] = useState(false);

    const handleSubmit = () => {
      const updatedReports = reports.map(item => {
        if (item.id === report.id) {
          return {
            ...item,
            detailContent: detailContent,
            status: 'submitted'
          };
        }
        return item;
      });
      setReports(updatedReports);
      localStorage.setItem('myReports', JSON.stringify(updatedReports));
      
      alert('신고가 안전신문고 양식으로 제출되었습니다.');
      setShowModal(false);
      onClose();
    };

    return (
      <div style={{
        height: '100%',
        overflowY: 'auto',
        background: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 헤더 */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border-light)',
          background: 'var(--bg-primary)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
            📄 신고 상세
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              padding: '4px 8px',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.color = 'var(--danger-red)'}
            onMouseOut={(e) => e.target.style.color = 'var(--text-tertiary)'}
          >
            ✖
          </button>
        </div>

        {/* 내용 */}
        <div style={{ flex: 1, padding: '24px' }}>
          {/* 비디오 */}
          {report.videoSrc ? (
            <video 
              src={report.videoSrc} 
              width="100%" 
              controls 
              style={{ 
                background: 'var(--bg-dark)', 
                borderRadius: 'var(--radius-lg)', 
                marginBottom: '24px',
                boxShadow: 'var(--shadow-md)'
              }}
            />
          ) : (
            <div style={{ 
              padding: '60px 40px', 
              textAlign: 'center', 
              background: 'var(--bg-tertiary)', 
              marginBottom: '24px',
              borderRadius: 'var(--radius-lg)',
              border: '2px dashed var(--border-medium)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📸</div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                분석 영상
              </div>
            </div>
          )}

          {/* 위반 내용 */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: 'var(--text-secondary)', 
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>위반 내용</div>
            <div style={{ 
              padding: '16px', 
              background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)', 
              borderRadius: 'var(--radius-lg)', 
              fontSize: '14px', 
              lineHeight: '1.8', 
              color: 'var(--text-primary)',
              border: '1px solid var(--border-light)',
              fontWeight: '500'
            }}>{report.desc}</div>
          </div>

          {/* 차량 번호 */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: 'var(--text-secondary)', 
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>차량 번호</div>
            <div style={{ 
              padding: '16px', 
              background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)', 
              borderRadius: 'var(--radius-lg)', 
              fontSize: '18px', 
              color: 'var(--text-primary)',
              border: '1px solid var(--border-light)',
              fontWeight: '700',
              textAlign: 'center',
              letterSpacing: '2px'
            }}>{report.plate}</div>
          </div>

          {/* 신고 일시 */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: 'var(--text-secondary)', 
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>신고 일시</div>
            <div style={{ 
              padding: '16px', 
              background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)', 
              borderRadius: 'var(--radius-lg)', 
              fontSize: '14px', 
              color: 'var(--text-primary)',
              border: '1px solid var(--border-light)',
              fontWeight: '600'
            }}>
              {report.time || report.date}
            </div>
          </div>

          {/* 상세 내용 */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: 'var(--text-secondary)', 
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>상세 내용 (초안)</span>
              <span style={{ 
                fontSize: '10px', 
                background: 'var(--warning-light)', 
                color: 'var(--warning-orange)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontWeight: '700'
              }}>수정 가능</span>
            </div>
            <textarea
              value={detailContent}
              onChange={(e) => setDetailContent(e.target.value)}
              style={{ 
                width: '100%',
                minHeight: '200px',
                padding: '16px', 
                background: 'var(--bg-primary)', 
                borderRadius: 'var(--radius-lg)', 
                fontSize: '13px', 
                lineHeight: '1.8', 
                color: 'var(--text-primary)',
                border: '2px solid var(--border-light)',
                fontFamily: 'inherit',
                resize: 'vertical',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-blue)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
              placeholder="상세 내용을 입력하세요..."
            />
            <div style={{ 
              fontSize: '11px', 
              color: 'var(--text-tertiary)', 
              marginTop: '8px',
              fontStyle: 'italic'
            }}>
              💡 Tip: AI가 생성한 초안을 자유롭게 수정하여 더 정확한 신고서를 작성할 수 있습니다.
            </div>
          </div>

          {/* 버튼 */}
          <button 
            style={{
              width: '100%',
              padding: '16px',
              background: 'var(--primary-gradient)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: 'var(--shadow-sm)'
            }}
            onClick={() => setShowModal(true)}
            onMouseOver={(e) => {
              e.target.style.boxShadow = 'var(--shadow-lg)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.boxShadow = 'var(--shadow-sm)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            신고 제출하기
          </button>
        </div>

        {/* 모달 */}
        {showModal && (
          <div className="modal active">
            <div className="modal-content">
              <div className="modal-title">✅ 제출 확인</div>
              <div className="modal-desc">
                해당 내용으로 신고를 접수하시겠습니까?<br/>
                제출 후에는 수정이 불가능합니다.
              </div>
              <div className="modal-buttons">
                <button className="modal-btn modal-btn-cancel" onClick={() => setShowModal(false)}>취소</button>
                <button className="modal-btn modal-btn-confirm" onClick={handleSubmit}>제출</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="screen active" style={{
      display: 'flex', 
      flexDirection: isDesktop ? 'row' : 'column', 
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* 왼쪽: 신고 목록 */}
      <div style={{
        width: isDesktop ? (selectedReportId ? '40%' : '100%') : '100%',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRight: isDesktop && selectedReportId ? '1px solid var(--border-light)' : 'none',
        transition: 'width 0.3s ease'
      }}>
        <div className="header">
          <h1>📝 신고 관리</h1>
          <p>내 신고 목록 및 AI 자동 분석</p>
        </div>

        {/* 스크롤 영역 */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* 업로드 영역 */}
          <div 
            style={{ 
              padding: '20px 15px', 
              background: 'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)',
              borderRadius: 'var(--radius-xl)', 
              margin: isDesktop ? '20px' : '24px', 
              border: '2px dashed var(--primary-blue)', 
              cursor: 'pointer', 
              textAlign: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: 'var(--shadow-sm)'
            }} 
            onClick={handleUploadClick}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary-dark)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary-blue)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📸</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              신고 자동 작성
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              영상을 업로드하면 AI가 자동으로<br/>위반 내용을 분석하고 신고서를 작성합니다.
            </div>
          </div>

          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="video/*" onChange={handleFileChange} />

          {/* 신고 목록 */}
          <div style={{ 
            padding: isDesktop ? '0 20px 20px' : '0 16px 16px',
            flex: 1
          }}>
            {reports.map((report) => (
              <div 
                key={report.id} 
                className="report-item" 
                onClick={() => handleReportClick(report)}
                style={{ 
                  opacity: report.status === 'processing' ? 0.95 : 1,
                  border: selectedReportId === report.id 
                    ? '2px solid var(--primary-blue)' 
                    : report.status === 'processing' 
                    ? '2px solid var(--primary-blue)' 
                    : '1px solid var(--border-light)',
                  background: selectedReportId === report.id
                    ? 'var(--primary-light)'
                    : report.status === 'processing' 
                    ? 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)' 
                    : 'var(--bg-primary)',
                  cursor: report.status === 'complete' ? 'pointer' : 'default',
                }}
              >
                <div className="report-thumbnail" style={{ 
                  background: report.status === 'processing' 
                    ? 'var(--bg-primary)' 
                    : report.status === 'error' 
                    ? 'linear-gradient(135deg, #FEE2E2 0%, #FCA5A5 100%)'
                    : 'var(--primary-gradient)',
                }}>
                  {report.status === 'processing' ? (
                    <div className="spinner"></div>
                  ) : report.status === 'error' ? (
                    '⚠️'
                  ) : (
                    '📸'
                  )}
                </div>

                <div className="report-info" style={{ flex: 1 }}>
                  <div className="report-title" style={{ 
                    color: report.status === 'processing' ? 'var(--primary-blue)' : 'var(--text-primary)',
                  }}>
                    {report.title}
                  </div>
                  
                  {report.status === 'processing' ? (
                    <div style={{ fontSize: '12px', color: 'var(--primary-blue)', fontWeight: '500' }}>
                      {report.progressMsg}
                    </div>
                  ) : report.status === 'error' ? (
                    <div style={{ fontSize: '12px', color: 'var(--danger-red)', fontWeight: '500' }}>
                      {report.progressMsg}
                    </div>
                  ) : (
                    <div className="report-meta">
                      {report.date} | {report.plate}
                    </div>
                  )}
                </div>

                {/* 우측 상태 영역 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <div 
                    onClick={(e) => deleteReport(e, report.id)}
                    style={{ 
                      cursor: 'pointer', 
                      color: 'var(--text-tertiary)', 
                      fontSize: '16px',
                      padding: '4px',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger-red)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                    title="삭제"
                  >
                    ✖
                  </div>

                  {report.status === 'complete' && (
                    <span className="report-status status-complete">완료</span>
                  )}
                  {report.status === 'submitted' && (
                    <span className="report-status" style={{ 
                      background: 'var(--info-light)', 
                      color: 'var(--info-blue)' 
                    }}>제출됨</span>
                  )}
                  {report.status === 'error' && (
                    <span className="report-status status-rejected">오류</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 오른쪽: 상세보기 (PC만) */}
      {isDesktop && selectedReportId && selectedReport && (
        <div style={{
          width: '60%',
          height: '100%',
          background: 'var(--bg-secondary)',
          boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.05)'
        }}>
          <ReportDetailCard 
            report={selectedReport} 
            onClose={() => setSelectedReportId(null)}
          />
        </div>
      )}

      <style>{`
        .spinner {
          width: 28px;
          height: 28px;
          border: 3px solid var(--border-light);
          border-top: 3px solid var(--primary-blue);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  );
};

export default Report;
