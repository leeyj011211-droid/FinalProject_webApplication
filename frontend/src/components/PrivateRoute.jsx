import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%', 
        flexDirection: 'column',
        color: '#64748B'
      }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚦</div>
        <div>로그인 정보 확인 중...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // 로그인이 안 되어 있으면 로그인 페이지로 튕김
    return <Navigate to="/login" replace />;
  }

  // 로그인 되어 있으면 자식 컴포넌트(Dashboard 등) 보여줌
  return children;
}

export default PrivateRoute;