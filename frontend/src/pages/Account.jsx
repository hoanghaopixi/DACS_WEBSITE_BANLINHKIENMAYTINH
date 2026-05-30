import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserCircle, FaInfoCircle, FaBox, FaLock, FaSignOutAlt, FaSave, FaCamera } from 'react-icons/fa';
import authService from '../services/authService';
import api from '../services/api';
import { validateChangePasswordForm } from '../utils/authValidation';
import '../styles/pages/Account.css';

function Account() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);
  const [activeTab, setActiveTab] = useState(null); // default to null

  // Customer Profile State
  const [customerInfo, setCustomerInfo] = useState({
    hoTen: '',
    sdt: '',
    email: '',
    diaChi: '',
    ngaySinh: '',
    gioiTinh: 'Khác'
  });
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Password State
  const [pwData, setPwData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMessage, setPwMessage] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  const isGoogleUser = authUser?.provider === 'google' || (!authUser?.phone && authUser?.anhDaiDien?.includes('googleusercontent'));

  useEffect(() => {
    const user = authService.getStoredUser();
    if (!user) {
      navigate('/login');
    } else if (user.roles?.some(role => role.toUpperCase() === 'ADMIN')) {
      navigate('/admin');
    } else {
      setAuthUser(user);
    }
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'info' && authUser?.maKH) {
      fetchCustomerInfo(authUser.maKH);
    }
    if (activeTab === 'orders' && authUser?.maKH) {
      fetchOrders(authUser.maKH);
    }
  }, [activeTab, authUser]);

  const fetchCustomerInfo = async (maKH) => {
    setLoadingInfo(true);
    try {
      const response = await api.get(`khach-hang/${maKH}`);
      if (response.data && response.data.data) {
        const data = response.data.data;
        setCustomerInfo({
          hoTen: data.hoTen || '',
          sdt: data.sdt || '',
          email: data.email || '',
          diaChi: data.diaChi || '',
          ngaySinh: data.ngaySinh || '',
          gioiTinh: data.gioiTinh || 'Khác'
        });
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin khách hàng:', error);
      setInfoMessage('Không thể tải thông tin. Vui lòng thử lại sau.');
    } finally {
      setLoadingInfo(false);
    }
  };

  const fetchOrders = async (maKH) => {
    setLoadingOrders(true);
    try {
      const response = await api.get(`don-hang/khach-hang/${maKH}`);
      if (response.data && response.data.data) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải đơn hàng:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    setLoadingDetails(true);
    try {
      const response = await api.get(`don-hang/${orderId}`);
      if (response.data && response.data.data) {
        setSelectedOrder(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết đơn hàng:', error);
      alert('Không thể tải chi tiết đơn hàng.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDetails = () => {
    setSelectedOrder(null);
  };

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setInfoMessage('');
    try {
      await api.put(`khach-hang/${authUser.maKH}`, customerInfo);
      setInfoMessage('Cập nhật thông tin thành công!');
      
      const updatedUser = { ...authUser, fullName: customerInfo.hoTen };
      localStorage.setItem('pc_store_auth_user', JSON.stringify(updatedUser));
      setAuthUser(updatedUser);
      window.dispatchEvent(new Event('auth-changed'));
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      setInfoMessage(error.response?.data?.message || 'Cập nhật thất bại.');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.');
      return;
    }
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post('upload/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const imageUrl = uploadRes.data?.data?.url || uploadRes.data?.data || uploadRes.data;
      
      await api.put(`auth/${authUser.maTK}/avatar`, { anhDaiDien: imageUrl });
      
      const updatedUser = { ...authUser, anhDaiDien: imageUrl };
      localStorage.setItem('pc_store_auth_user', JSON.stringify(updatedUser));
      setAuthUser(updatedUser);
      window.dispatchEvent(new Event('auth-changed'));
      setInfoMessage('Cập nhật ảnh đại diện thành công!');
    } catch (error) {
      console.error('Lỗi upload avatar:', error);
      setInfoMessage('Không thể cập nhật ảnh đại diện.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePwChange = (e) => {
    setPwData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMessage('');

    const validationError = validateChangePasswordForm({
      oldPassword: pwData.oldPassword,
      newPassword: pwData.newPassword,
      confirmPassword: pwData.confirmPassword
    });

    if (validationError) {
      setPwMessage(validationError);
      return;
    }
    
    try {
      await api.put(`auth/${authUser.maTK}/change-password`, {
        oldPassword: pwData.oldPassword,
        newPassword: pwData.newPassword
      });
      setPwMessage('Đổi mật khẩu thành công!');
      setPwData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPwMessage(error.response?.data?.message || 'Lỗi đổi mật khẩu. Hãy kiểm tra lại mật khẩu cũ.');
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.dispatchEvent(new Event('auth-changed'));
    navigate('/login');
  };

  if (!authUser) return null;

  return (
    <div className="account-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link> {'>'} <span>Tài khoản</span>
        </div>
        
        <div className="account-layout">
          {/* Sidebar */}
          <aside className="account-sidebar">
            <div className="account-profile">
              {authUser.anhDaiDien ? (
                <img src={authUser.anhDaiDien} alt="avatar" className="profile-avatar" referrerPolicy="no-referrer" />
              ) : (
                <FaUserCircle className="profile-icon" />
              )}
              <div className="profile-info">
                <span className="profile-label">Tài khoản</span>
                <strong className="profile-name">
                  {authUser.fullName || authUser.username}
                </strong>
              </div>
            </div>

            <ul className="account-menu">
              <li>
                <button 
                  className={`menu-item ${activeTab === 'info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  <FaInfoCircle /> Thông tin tài khoản
                </button>
              </li>
              <li>
                <button 
                  className={`menu-item ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  <FaBox /> Quản lý đơn hàng
                </button>
              </li>
              {!isGoogleUser && (
                <li>
                  <button 
                    className={`menu-item ${activeTab === 'password' ? 'active' : ''}`}
                    onClick={() => setActiveTab('password')}
                  >
                    <FaLock /> Thay đổi mật khẩu
                  </button>
                </li>
              )}
              <li>
                <button className="menu-item logout-link" onClick={handleLogout}>
                  <FaSignOutAlt /> Đăng xuất
                </button>
              </li>
            </ul>
          </aside>

          {/* Main Content */}
          <main className="account-content">
            {!activeTab && (
              <p>Bạn đang ở trang tài khoản. Vui lòng chọn các mục bên trái để xem thông tin.</p>
            )}

            {activeTab === 'info' && (
              <div className="account-section">
                <h2>Thông tin cá nhân</h2>
                {infoMessage && <div className={`alert-msg ${infoMessage.includes('thành công') ? 'success' : 'error'}`}>{infoMessage}</div>}
                
                <div className="avatar-upload-section">
                  <div className="avatar-preview" onClick={() => avatarInputRef.current?.click()}>
                    {authUser.anhDaiDien ? (
                      <img src={authUser.anhDaiDien} alt="avatar" className="avatar-image" referrerPolicy="no-referrer" />
                    ) : (
                      <FaUserCircle className="avatar-placeholder" />
                    )}
                    <div className="avatar-overlay">
                      <FaCamera />
                      <span>{uploadingAvatar ? 'Đang tải...' : 'Đổi ảnh'}</span>
                    </div>
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                </div>
                
                {loadingInfo ? (
                  <p>Đang tải dữ liệu...</p>
                ) : (
                  <form className="account-form" onSubmit={handleUpdateInfo}>
                    <div className="form-group">
                      <label>Họ và tên</label>
                      <input type="text" name="hoTen" value={customerInfo.hoTen} onChange={handleInfoChange} required />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Số điện thoại</label>
                        <input type="tel" name="sdt" value={customerInfo.sdt} onChange={handleInfoChange} />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={customerInfo.email} onChange={handleInfoChange} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Địa chỉ</label>
                      <input type="text" name="diaChi" value={customerInfo.diaChi} onChange={handleInfoChange} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Ngày sinh</label>
                        <input type="date" name="ngaySinh" value={customerInfo.ngaySinh} onChange={handleInfoChange} />
                      </div>
                      <div className="form-group">
                        <label>Giới tính</label>
                        <select name="gioiTinh" value={customerInfo.gioiTinh} onChange={handleInfoChange}>
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="btn-save">
                      <FaSave /> Lưu thay đổi
                    </button>
                  </form>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="account-section orders-section">
                <h2>Quản lý đơn hàng</h2>
                {loadingOrders ? (
                  <p>Đang tải đơn hàng...</p>
                ) : orders.length === 0 ? (
                  <p>Bạn chưa có đơn hàng nào.</p>
                ) : (
                  <div className="orders-list">
                    <table className="orders-table">
                      <thead>
                        <tr>
                          <th>Mã ĐH</th>
                          <th>Ngày đặt</th>
                          <th>Tổng tiền</th>
                          <th>Trạng thái</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.maDonHang}>
                            <td>#{order.maDonHang}</td>
                            <td>{new Date(order.ngayDat).toLocaleDateString('vi-VN')}</td>
                            <td className="order-price">{new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(order.tongTien)}</td>
                            <td><span className={`status-badge ${order.trangThai === 'Hoàn thành' ? 'success' : order.trangThai === 'Đã hủy' ? 'danger' : 'warning'}`}>{order.trangThai}</span></td>
                            <td>
                              <button className="btn-view-detail" onClick={() => fetchOrderDetails(order.maDonHang)}>
                                Xem chi tiết
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'password' && (
              <div className="account-section pw-section">
                <h2>Thay đổi mật khẩu</h2>
                {pwMessage && <div className={`alert-msg ${pwMessage.includes('thành công') ? 'success' : 'error'}`}>{pwMessage}</div>}
                <form className="account-form" onSubmit={handleChangePassword}>
                  <div className="form-group">
                    <label>Mật khẩu cũ</label>
                    <input type="password" name="oldPassword" value={pwData.oldPassword} onChange={handlePwChange} required />
                  </div>
                  <div className="form-group">
                    <label>Mật khẩu mới</label>
                    <input type="password" name="newPassword" value={pwData.newPassword} onChange={handlePwChange} required />
                    <small>Phải dài 8-32 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&._-)</small>
                  </div>
                  <div className="form-group">
                    <label>Xác nhận mật khẩu mới</label>
                    <input type="password" name="confirmPassword" value={pwData.confirmPassword} onChange={handlePwChange} required />
                  </div>
                  <button type="submit" className="btn-save">
                    Cập nhật mật khẩu
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content order-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết đơn hàng #{selectedOrder.maDonHang}</h3>
              <button className="close-btn" onClick={closeDetails}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="order-info-grid">
                <div className="info-group">
                  <label>Ngày đặt:</label>
                  <span>{new Date(selectedOrder.ngayDat).toLocaleString('vi-VN')}</span>
                </div>
                <div className="info-group">
                  <label>Trạng thái:</label>
                  <span className={`status-badge ${selectedOrder.trangThai === 'Hoàn thành' ? 'success' : selectedOrder.trangThai === 'Đã hủy' ? 'danger' : 'warning'}`}>
                    {selectedOrder.trangThai}
                  </span>
                </div>
                <div className="info-group">
                  <label>Người nhận:</label>
                  <span>{selectedOrder.tenNguoiNhan}</span>
                </div>
                <div className="info-group">
                  <label>Số điện thoại:</label>
                  <span>{selectedOrder.sdtNguoiNhan}</span>
                </div>
                <div className="info-group full-width">
                  <label>Địa chỉ:</label>
                  <span>
                    {selectedOrder.diaChiChiTiet}, {selectedOrder.xa?.tenXa}, {selectedOrder.xa?.huyen?.tenHuyen}, {selectedOrder.xa?.huyen?.tinh?.tenTinh}
                  </span>
                </div>
              </div>

              <div className="order-items-list">
                <h4>Sản phẩm đã chọn</h4>
                <div className="items-table-container">
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Đơn giá</th>
                        <th>Số lượng</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.chiTietDonHangs?.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <div className="item-product-info">
                              <img src={item.sanPham?.hinhAnh || '/placeholder.png'} alt={item.sanPham?.tenSP} />
                              <span>{item.sanPham?.tenSP}</span>
                            </div>
                          </td>
                          <td>{new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(item.donGia)}</td>
                          <td>x{item.soLuong}</td>
                          <td className="item-subtotal">
                            {new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(item.donGia * item.soLuong)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="order-summary-details">
                <div className="summary-row">
                  <span>Phí vận chuyển:</span>
                  <span>{new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(selectedOrder.phiVanChuyen || 0)}</span>
                </div>
                <div className="summary-row total">
                  <span>Tổng tiền:</span>
                  <span className="final-total">{new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(selectedOrder.tongTien)}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-close-modal" onClick={closeDetails}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Account;
