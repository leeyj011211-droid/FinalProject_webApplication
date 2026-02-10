import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 

const Support = () => {
  const { user, logout } = useAuth(); 
  const navigate = useNavigate(); 
  
  const [showModal, setShowModal] = useState(false);
  const [serialInput, setSerialInput] = useState("");
  
  const [deviceList, setDeviceList] = useState([]);
  const [activeDevice, setActiveDevice] = useState(null);

  const [portalId, setPortalId] = useState("");
  const [portalPw, setPortalPw] = useState("");

  useEffect(() => {
    if (user) {
        setPortalId(user.safetyPortalId || user.safety_portal_id || "");
        setPortalPw(user.safetyPortalPw || user.safety_portal_pw || "");
    }
  }, [user]);

  const fetchMyDevices = async () => {
    if (!user) return;
    const targetId = user.history_id || user.id;

    try {
        const res = await fetch(`http://localhost:8080/api/device/${targetId}`);
        if (res.ok) {
            const data = await res.json();
            
            if (!data || (Array.isArray(data) && data.length === 0)) {
                setDeviceList([]);
                setActiveDevice(null);
                localStorage.removeItem('connectedSerial');
                return;
            }

            const devices = Array.isArray(data) ? data : [data];
            setDeviceList(devices);

            const savedSerial = localStorage.getItem('connectedSerial');
            if (savedSerial) {
                const targetDevice = devices.find(d => (d.serialNo || d.serial_no) === savedSerial);
                if (targetDevice) {
                    setActiveDevice(targetDevice);
                } else {
                    setActiveDevice(null);
                    localStorage.removeItem('connectedSerial');
                }
            } else {
                setActiveDevice(null);
            }
        }
    } catch (e) {
        console.error("기기 목록 로드 실패:", e);
    }
  };

  useEffect(() => {
    fetchMyDevices();
  }, [user]);

  const handleLogout = async () => {
    try { await fetch('http://localhost:8000/auth/logout', { method: 'POST' }); } 
    catch (error) { console.error(error); } 
    finally { 
        logout(); 
        localStorage.removeItem('connectedSerial'); 
        navigate('/login'); 
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("정말로 탈퇴하시겠습니까?\n복구할 수 없습니다.")) return;
    const targetId = user?.history_id || user?.id;
    try {
        const res = await fetch(`http://localhost:8080/api/user/${targetId}`, { method: 'DELETE' });
        if (res.ok) { 
            alert("탈퇴 완료"); 
            logout(); 
            localStorage.removeItem('connectedSerial');
            navigate('/login'); 
        }
    } catch (e) { console.error(e); }
  };

  const handleRegisterDevice = async () => {
    if (!serialInput.trim()) return alert("시리얼 번호를 입력해주세요.");
    const targetId = user?.history_id || user?.id;
    
    try {
      const res = await fetch('http://localhost:8080/api/device/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialNo: serialInput, historyId: targetId })
      });

      if (res.ok) {
        alert(`✅ 기기(${serialInput}) 등록 완료!`);
        setShowModal(false);
        setSerialInput("");
        fetchMyDevices(); 
      } else {
        alert("등록 실패: 이미 존재하는 기기이거나 오류입니다.");
      }
    } catch (e) { console.error(e); alert("서버 연결 실패"); }
  };

  const handleSavePortalInfo = async () => {
    if (!portalId.trim() || !portalPw.trim()) {
        return alert("안전신문고 ID와 비밀번호를 모두 입력해주세요.");
    }

    const pwRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{9,12}$/;
    if (!pwRegex.test(portalPw)) {
        return alert("비밀번호는 9자 이상 12자 이하의 영문, 숫자, 특수문자(!@#$%^&*)를 혼용하여 설정해야 합니다.");
    }
    
    const targetId = user?.history_id || user?.id;
    
    try {
        const res = await fetch(`http://localhost:8080/api/user/${targetId}/portal-info`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                safetyPortalId: portalId, 
                safetyPortalPw: portalPw 
            })
        });

        if (res.ok) {
            alert("안전신문고 정보가 저장되었습니다.");
        } else if (res.status === 409) {
            alert("이미 다른 사용자가 등록한 안전신문고 아이디입니다.");
        } else {
            alert("저장 실패: 서버 오류가 발생했습니다.");
        }
    } catch (e) {
        console.error(e);
        alert("서버 연결 실패");
    }
  };

  const handleDisconnect = (e) => {
    e.stopPropagation();
    if (window.confirm("현재 기기와의 연동을 해제하시겠습니까?\n(기기 목록에는 유지됩니다)")) {
        setActiveDevice(null);
        localStorage.removeItem('connectedSerial');
    }
  };

  const handleConnect = (device) => {
    setActiveDevice(device);
    const sNo = device.serialNo || device.serial_no;
    localStorage.setItem('connectedSerial', sNo);
    alert(`기기(${sNo})와 연결되었습니다.`);
  };

  const handleCopySerial = (serial) => {
    navigator.clipboard.writeText(serial);
    alert(`복사됨: ${serial}`);
  };

  return (
    <div className="screen active">
      <div className="header">
        <h1>💬 마이페이지</h1>
        <p>내 정보 및 기기 설정</p>
      </div>

      <div style={{ padding: '20px', paddingBottom: '100px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* 프로필 카드 */}
        {user && (
            <div className="analytics-card" style={{ 
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FEF9C3 100%)', 
              border: '1px solid var(--warning-light)', margin: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '50px' }}>👤</div>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#92400E' }}>
                            {user.nickname || user.user_name || "사용자"}님
                        </div>
                        <div style={{ fontSize: '13px', color: '#B45309', fontWeight: '500' }}>
                            환영합니다! 👋
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(146, 64, 14, 0.7)', marginTop: '2px' }}>
                            {user.email} (ID: {user.history_id || user.id})
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* 현재 연결된 기기 상태 카드 */}
        <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            padding: '20px', 
            border: activeDevice ? '2px solid #3B82F6' : '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px'}}>
                <div style={{ fontSize: '32px' }}>{activeDevice ? '📡' : '🔌'}</div>
                <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: activeDevice ? '#1E40AF' : '#666' }}>
                        {activeDevice ? '현재 연결된 기기' : '연결된 기기가 없습니다'}
                    </div>
                    {activeDevice && (
                        <div style={{ fontSize: '13px', color: '#3B82F6', marginTop: '4px', fontFamily: 'monospace' }}>
                            {activeDevice.serialNo || activeDevice.serial_no}
                        </div>
                    )}
                </div>
            </div>
            
            {activeDevice && (
                <button 
                    onClick={handleDisconnect}
                    style={{ 
                        padding: '6px 12px', borderRadius: '8px', border: '1px solid #fee2e2', 
                        background: '#fef2f2', color: '#ef4444', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' 
                    }}
                >
                    해제
                </button>
            )}
        </div>

        {/* 내 기기 목록 박스 */}
        <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            padding: '20px', 
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', marginBottom: '15px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span>📋 내 기기 목록</span>
                <button onClick={() => setShowModal(true)} style={{ background:'none', border:'none', color:'#3B82F6', fontSize:'13px', fontWeight:'600', cursor:'pointer' }}>+ 새 기기 등록</button>
            </div>

            {deviceList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', background: '#f9fafb', borderRadius: '12px', color: '#9ca3af', fontSize: '13px' }}>
                    등록된 기기가 없습니다.<br/>새 기기를 등록해주세요.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {deviceList.map((device, idx) => {
                        const sNo = device.serialNo || device.serial_no;
                        const isActive = activeDevice && (activeDevice.serialNo === sNo || activeDevice.serial_no === sNo);

                        return (
                            <div key={idx} style={{ 
                                background: '#F9FAFB',
                                padding: '16px', 
                                borderRadius: '12px', 
                                border: '1px solid #e5e7eb',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}>
                                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                                    <div style={{ width:'8px', height:'8px', borderRadius:'50%', background: isActive ? '#10B981' : '#D1D5DB' }}></div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Raspberry Pi</div>
                                        <div style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'monospace' }}>{sNo}</div>
                                    </div>
                                </div>

                                <div style={{ display:'flex', gap:'8px' }}>
                                    <button 
                                        onClick={() => handleCopySerial(sNo)}
                                        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white', color: '#6B7280', fontSize: '11px', cursor:'pointer' }}
                                    >
                                        복사
                                    </button>
                                    {!isActive && (
                                        <button 
                                            onClick={() => handleConnect(device)}
                                            style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', background: '#3B82F6', color: 'white', fontSize: '11px', fontWeight:'bold', cursor:'pointer' }}
                                        >
                                            연결
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        {/* 안전신문고 섹션 */}
        <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            padding: '20px', 
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', marginBottom: '15px', display:'flex', alignItems:'center', gap:'8px' }}>
                <span>🔒 안전신문고 연동 설정</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input 
                    type="text" 
                    placeholder="안전신문고 ID" 
                    value={portalId}
                    onChange={(e) => setPortalId(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #eee', fontSize: '14px', outline: 'none', background: '#f9fafb' }}
                />
                <input 
                    type="password" 
                    placeholder="안전신문고 비밀번호" 
                    value={portalPw}
                    onChange={(e) => setPortalPw(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #eee', fontSize: '14px', outline: 'none', background: '#f9fafb' }}
                />
                <button 
                    onClick={handleSavePortalInfo}
                    style={{ 
                        padding: '12px', 
                        borderRadius: '8px', 
                        border: 'none', 
                        background: '#374151', 
                        color: 'white', 
                        fontSize: '14px',
                        fontWeight: 'bold', 
                        cursor: 'pointer',
                        marginTop: '5px'
                    }}
                >
                    계정 정보 저장
                </button>
            </div>
        </div>

        {/* 하단 메뉴 (자주 묻는 질문 삭제됨) */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button className="btn" onClick={handleLogout} style={{ background: 'var(--bg-secondary)', color: 'var(--danger-red)', border: '1px solid var(--border-light)', width: '100%', margin: 0, justifyContent: 'center' }}>로그아웃</button>
                <div style={{ textAlign: 'center', marginTop: '8px' }}><span onClick={handleDeleteAccount} style={{ fontSize: '12px', color: '#9CA3AF', textDecoration: 'underline', cursor: 'pointer' }}>회원 탈퇴하기</span></div>
            </div>
        </div>

      </div>

      {/* 모달 */}
      {showModal && (
        <div className="modal active">
          <div className="modal-content">
            <h3 className="modal-title" style={{ textAlign: 'center' }}>📡 새 기기 등록</h3>
            <p className="modal-desc" style={{ textAlign: 'center' }}>시리얼 번호를 입력해주세요.</p>
            <input type="text" placeholder="예: RPI-XXXX-XXXX" value={serialInput} onChange={(e) => setSerialInput(e.target.value)} className="chat-input-field" style={{ width: '100%', marginBottom: '20px', height: '48px', textAlign: 'center' }} />
            <div className="modal-buttons">
              <button onClick={() => setShowModal(false)} className="modal-btn modal-btn-cancel">취소</button>
              <button onClick={handleRegisterDevice} className="modal-btn modal-btn-confirm">등록 확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;