import { useNavigate, Outlet, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { FaBell, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import authService from '../services/authService';
import '../styles/layouts/AdminLayout.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const contentRef = useRef(null);
  const user = authService.getStoredUser();

  // Scroll admin content to top on route change
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  // ============ ROLE GUARD ============
  // Chưa đăng nhập → redirect về login
  if (!user || !user.accessToken) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role ADMIN
  const isAdmin = user.roles?.some(
    role => role.toUpperCase() === 'ADMIN'
  );

  // Đã đăng nhập nhưng không phải admin → redirect về trang chủ
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  // =====================================

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      authService.logout();
      navigate('/login');
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar isOpen={true} />
      
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <div className="admin-logo-mobile">Hoàng Hảo PC</div>
          </div>
          
          <div className="topbar-right">
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">{user?.fullName || user?.username || 'Admin'}</span>
                <span className="user-role">{user?.roles?.join(', ') || 'Admin'}</span>
              </div>
              {user?.anhDaiDien ? (
                <img 
                  src={user.anhDaiDien} 
                  alt="Avatar" 
                  referrerPolicy="no-referrer"
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} 
                />
              ) : (
                <FaUserCircle className="user-avatar" />
              )}
            </div>
            <button className="header-logout-btn" title="Đăng xuất" onClick={handleLogout}>
              <FaSignOutAlt />
              <span>Đăng xuất</span>
            </button>
          </div>
        </header>
        
        <div className="admin-content-area" ref={contentRef}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
