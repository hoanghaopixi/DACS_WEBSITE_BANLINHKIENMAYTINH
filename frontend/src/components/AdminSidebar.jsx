import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  FaChartPie, FaChartBar, FaBox, FaShoppingCart, FaUsers,
  FaUserTie, FaTags, FaTree, FaTruckLoading,
  FaFileInvoiceDollar, FaRegNewspaper, FaAd,
  FaSignOutAlt, FaCog, FaCartArrowDown, FaReceipt, FaUsersCog, FaTrademark,
  FaExclamationTriangle, FaSave, FaUndo, FaTimes
} from 'react-icons/fa';
import '../styles/components/AdminSidebar.css';
import { useSettings } from '../context/SettingsContext';

/* ---- Unsaved Changes Modal ---- */
const UnsavedChangesModal = ({ isOpen, onSave, onDiscard, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="unsaved-modal-overlay" onClick={onCancel}>
      <div className="unsaved-modal" onClick={e => e.stopPropagation()}>
        <button className="unsaved-modal-close" onClick={onCancel}>
          <FaTimes />
        </button>

        <div className="unsaved-modal-icon">
          <FaExclamationTriangle />
        </div>

        <h3 className="unsaved-modal-title">Thay đổi chưa được lưu</h3>
        <p className="unsaved-modal-desc">
          Bạn đã thay đổi một số cài đặt nhưng chưa lưu lại.
          Bạn muốn lưu trước khi rời trang hay bỏ qua?
        </p>

        <div className="unsaved-modal-actions">
          <button className="unsaved-btn-discard" onClick={onDiscard}>
            <FaUndo /> Bỏ thay đổi
          </button>
          <button className="unsaved-btn-save" onClick={onSave}>
            <FaSave /> Lưu & Rời trang
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const { settings, isDirty, commitSettings, revertSettings } = useSettings();
  const isCompact = settings.compactMode;
  const navigate = useNavigate();
  const location = useLocation();

  // State for unsaved changes modal
  const [showModal, setShowModal] = useState(false);
  const [pendingPath, setPendingPath] = useState(null);

  const navItems = [
    { label: 'Tổng quan', icon: <FaChartPie />, path: '/admin', end: true },
    { type: 'group', label: 'Quản lý bán hàng' },
    { label: 'Thống kê', icon: <FaChartBar />, path: '/admin/statistics' },
    { label: 'Sản phẩm', icon: <FaBox />, path: '/admin/products' },
    { label: 'Đơn hàng', icon: <FaShoppingCart />, path: '/admin/orders' },
    { label: 'Hóa đơn', icon: <FaReceipt />, path: '/admin/invoices' },
    { label: 'Giỏ hàng', icon: <FaCartArrowDown />, path: '/admin/carts' },
    { label: 'Khách hàng', icon: <FaUsers />, path: '/admin/customers' },
    { label: 'Khuyến mãi', icon: <FaTags />, path: '/admin/promotions' },

    { type: 'group', label: 'Quản lý kho' },
    { label: 'Nhà cung cấp', icon: <FaTruckLoading />, path: '/admin/suppliers' },
    { label: 'Nhập hàng', icon: <FaFileInvoiceDollar />, path: '/admin/inventory' },
    { label: 'Danh mục', icon: <FaTree />, path: '/admin/categories' },
    { label: 'Thương hiệu', icon: <FaTrademark />, path: '/admin/brands' },

    { type: 'group', label: 'Hệ thống & Nội dung' },
    { label: 'Nhân viên', icon: <FaUserTie />, path: '/admin/employees' },
    { label: 'Tài khoản', icon: <FaUsersCog />, path: '/admin/accounts' },
    { label: 'Bài viết', icon: <FaRegNewspaper />, path: '/admin/posts' },
    { label: 'Quảng cáo', icon: <FaAd />, path: '/admin/ads' },
    { label: 'Cài đặt', icon: <FaCog />, path: '/admin/settings' },
  ];

  // Handle sidebar link click — intercept if settings are dirty
  const handleNavClick = (e, path) => {
    // Only intercept if we're on the settings page AND there are unsaved changes
    if (isDirty && location.pathname === '/admin/settings' && path !== '/admin/settings') {
      e.preventDefault();
      setPendingPath(path);
      setShowModal(true);
    } else {
      // Normal navigation
      if (window.innerWidth < 768) toggleSidebar();
    }
  };

  const handleModalSave = () => {
    commitSettings();
    setShowModal(false);
    if (pendingPath) {
      navigate(pendingPath);
      setPendingPath(null);
    }
    if (window.innerWidth < 768) toggleSidebar();
  };

  const handleModalDiscard = () => {
    revertSettings();
    setShowModal(false);
    if (pendingPath) {
      navigate(pendingPath);
      setPendingPath(null);
    }
    if (window.innerWidth < 768) toggleSidebar();
  };

  const handleModalCancel = () => {
    setShowModal(false);
    setPendingPath(null);
  };

  return (
    <>
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''} ${isCompact ? 'compact' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            {!isCompact && (
              <>
                <div className="logo-main">Hoàng Hảo PC</div>
                <div className="logo-sub">Trang quản trị</div>
              </>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => {
            if (item.type === 'group') {
              return !isCompact ? <div key={index} className="nav-group-label">{item.label}</div> : <div key={index} className="nav-group-divider" style={{ borderTop: '1px solid #1e293b', margin: '8px 16px' }}></div>;
            }
            return (
              <NavLink
                key={index}
                to={item.path}
                end={item.end}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, item.path)}
                title={isCompact ? item.label : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCompact && <span className="nav-label">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={showModal}
        onSave={handleModalSave}
        onDiscard={handleModalDiscard}
        onCancel={handleModalCancel}
      />
    </>
  );
};

export default AdminSidebar;
