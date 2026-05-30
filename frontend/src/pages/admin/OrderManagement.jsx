import React, { useState, useEffect, useMemo } from 'react';
import { FaEye, FaTrash, FaSearch, FaFileDownload, FaTimes, FaMapMarkerAlt, FaPhone, FaUser, FaBox, FaStickyNote, FaCheck, FaPlus } from 'react-icons/fa';
import orderService from '../../services/orderService';
import OrderCreateModal from '../../components/admin/OrderCreateModal';
import '../../styles/pages/CommonAdmin.css';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const payload = await orderService.getAllOrders();
      if (payload && payload.code === 200) {
        setOrders(payload.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải đơn hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (order, newStatus) => {
    try {
      const updatedOrder = { ...order, trangThai: newStatus };
      await orderService.updateOrder(order.maDonHang, updatedOrder);
      fetchOrders();
      // Update selected order if viewing
      if (selectedOrder && selectedOrder.maDonHang === order.maDonHang) {
        setSelectedOrder(prev => ({ ...prev, trangThai: newStatus }));
      }
    } catch (error) {
      alert('Lỗi khi cập nhật trạng thái: ' + error.message);
    }
  };

  const handleViewDetail = async (orderId) => {
    try {
      setDetailLoading(true);
      const payload = await orderService.getOrderById(orderId);
      if (payload && payload.code === 200) {
        setSelectedOrder(payload.data);
      }
    } catch (error) {
      alert('Lỗi khi tải chi tiết đơn hàng: ' + error.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      try {
        await orderService.deleteOrder(id);
        fetchOrders();
      } catch (error) {
        alert('Lỗi khi xóa: ' + error.message);
      }
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Hoàn thành': return 'completed';
      case 'Đã hủy': return 'cancelled';
      case 'Đang giao': return 'shipping';
      case 'Đã xác nhận': return 'shipping';
      default: return 'pending';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Hoàn thành': return { bg: '#dcfce7', color: '#16a34a' };
      case 'Đã hủy': return { bg: '#fee2e2', color: '#dc2626' };
      case 'Đang giao': return { bg: '#dbeafe', color: '#2563eb' };
      case 'Đã xác nhận': return { bg: '#e0e7ff', color: '#4f46e5' };
      default: return { bg: '#fef3c7', color: '#d97706' };
    }
  };

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (statusFilter) {
      result = result.filter(order => order.trangThai === statusFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter(order => {
        const idMatch = String(order.maDonHang).includes(term);
        const nameMatch = (order.tenNguoiNhan || '').toLowerCase().includes(term);
        const phoneMatch = (order.sdtNguoiNhan || '').includes(term);
        const dateMatch = formatDate(order.ngayDat).toLowerCase().includes(term);
        return idMatch || nameMatch || phoneMatch || dateMatch;
      });
    }
    return result;
  }, [orders, searchTerm, statusFilter]);

  // Build full address from order
  const getFullAddress = (order) => {
    const parts = [];
    if (order.diaChiChiTiet) parts.push(order.diaChiChiTiet);
    if (order.xa) {
      if (order.xa.tenXa) parts.push(order.xa.tenXa);
      if (order.xa.huyen) {
        if (order.xa.huyen.tenHuyen) parts.push(order.xa.huyen.tenHuyen);
        if (order.xa.huyen.tinh && order.xa.huyen.tinh.tenTinh) parts.push(order.xa.huyen.tinh.tenTinh);
      }
    }
    return parts.join(', ') || 'Không có địa chỉ';
  };

  return (
    <div className="admin-page">
      <div className="admin-header-flex">
        <h1 className="admin-title">Quản lý đơn hàng</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <FaPlus /> Tạo đơn hàng mới
          </button>
        </div>
      </div>

      <div className="admin-page-body">

      <div className="admin-card">
        <div className="table-actions" style={{ marginBottom: '24px' }}>
          <div className="search-box-wrapper">
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Tìm theo mã đơn, tên khách, SĐT, ngày đặt..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '160px', padding: '10px 14px', borderRadius: '12px' }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Chờ xác nhận">Chờ xác nhận</option>
              <option value="Đã xác nhận">Đã xác nhận</option>
              <option value="Đang giao">Đang giao</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Nhân viên lập</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                  {searchTerm || statusFilter ? 'Không tìm thấy đơn hàng phù hợp.' : 'Chưa có đơn hàng nào.'}
                </td></tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.maDonHang}>
                  <td>#{order.maDonHang}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600 }}>{order.tenNguoiNhan}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.sdtNguoiNhan}</span>
                    </div>
                  </td>
                  <td>{order.nhanVien ? order.nhanVien.hoTen : 'Online/Hệ thống'}</td>
                  <td>{formatDate(order.ngayDat)}</td>
                  <td style={{ fontWeight: 700 }}>{formatCurrency(order.tongTien)}</td>
                  <td>
                    <select 
                      className={`status-badge ${getStatusClass(order.trangThai)}`}
                      value={order.trangThai}
                      onChange={(e) => handleStatusChange(order, e.target.value)}
                      style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="Chờ xác nhận">Chờ xác nhận</option>
                      <option value="Đã xác nhận">Đã xác nhận</option>
                      <option value="Đang giao">Đang giao</option>
                      <option value="Hoàn thành">Hoàn thành</option>
                      <option value="Đã hủy">Đã hủy</option>
                    </select>
                  </td>
                  <td>
                    <div className="action-btns">
                      {order.trangThai === 'Chờ xác nhận' && (
                        <button 
                          className="btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', background: '#10b981', borderColor: '#10b981' }} 
                          title="Xác nhận đơn" 
                          onClick={() => handleStatusChange(order, 'Đã xác nhận')}
                        >
                          <FaCheck size={12} /> Xác nhận
                        </button>
                      )}
                      <button className="btn-icon btn-edit" title="Xem chi tiết" onClick={() => handleViewDetail(order.maDonHang)}><FaEye /></button>
                      <button className="btn-icon btn-delete" title="Xóa" onClick={() => handleDelete(order.maDonHang)}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '20px'
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '700px',
              maxHeight: '90vh', overflow: 'auto', color: '#334155',
              boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '24px 28px', borderBottom: '1px solid #e2e8f0',
              position: 'sticky', top: 0, background: '#fff', zIndex: 1
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                  Chi tiết đơn hàng #{selectedOrder.maDonHang}
                </h2>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {formatDate(selectedOrder.ngayDat)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  padding: '6px 16px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700,
                  background: getStatusColor(selectedOrder.trangThai).bg,
                  color: getStatusColor(selectedOrder.trangThai).color
                }}>
                  {selectedOrder.trangThai}
                </span>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    background: '#f1f5f9', border: 'none', color: '#64748b',
                    borderRadius: '50%', width: '36px', height: '36px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                  onMouseOut={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {detailLoading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Đang tải chi tiết...</div>
            ) : (
              <div style={{ padding: '24px 28px' }}>
                {/* Customer & Delivery Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <FaUser style={{ color: '#6366f1' }} />
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>Khách hàng</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', lineHeight: '1.8' }}>
                      <div><strong style={{ color: '#1e293b' }}>{selectedOrder.tenNguoiNhan}</strong></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                        <FaPhone size={11} /> {selectedOrder.sdtNguoiNhan}
                      </div>
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <FaMapMarkerAlt style={{ color: '#f59e0b' }} />
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>Địa chỉ giao hàng</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                      {getFullAddress(selectedOrder)}
                    </div>
                  </div>
                </div>

                {/* Ghi chú */}
                {selectedOrder.ghiChu && (
                  <div style={{ 
                    background: '#fffbeb', borderRadius: '12px', padding: '14px 16px', 
                    marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '10px',
                    border: '1px solid #fef3c7'
                  }}>
                    <FaStickyNote style={{ color: '#f59e0b', marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#92400e' }}>Ghi chú: </span>
                      <span style={{ fontSize: '0.85rem', color: '#78350f' }}>{selectedOrder.ghiChu}</span>
                    </div>
                  </div>
                )}

                {/* Products */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <FaBox style={{ color: '#10b981' }} />
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                      Sản phẩm ({selectedOrder.chiTietDonHangs?.length || 0})
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedOrder.chiTietDonHangs && selectedOrder.chiTietDonHangs.length > 0 ? (
                      selectedOrder.chiTietDonHangs.map((item, index) => (
                        <div key={index} style={{
                          background: '#f8fafc', borderRadius: '12px', padding: '14px 16px',
                          display: 'flex', alignItems: 'center', gap: '14px',
                          border: '1px solid #e2e8f0'
                        }}>
                          {item.sanPham?.hinhAnh && (
                            <img 
                              src={item.sanPham.hinhAnh} 
                              alt={item.sanPham?.tenSP} 
                              style={{ 
                                width: '50px', height: '50px', borderRadius: '8px', 
                                objectFit: 'cover', border: '1px solid #e2e8f0' 
                              }} 
                            />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.sanPham?.tenSP || 'Sản phẩm không xác định'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              Đơn giá: {formatCurrency(item.donGia)} × {item.soLuong}
                            </div>
                          </div>
                          <div style={{ fontWeight: 700, color: '#6366f1', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                            {formatCurrency(item.donGia * item.soLuong)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                        Không có thông tin sản phẩm.
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div style={{ 
                  background: '#f8fafc', borderRadius: '12px', padding: '20px',
                  border: '1px solid #e2e8f0', borderTop: '3px solid #6366f1'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748b' }}>Tạm tính</span>
                    <span style={{ color: '#334155' }}>
                      {formatCurrency(
                        selectedOrder.chiTietDonHangs?.reduce((sum, item) => sum + (item.donGia * item.soLuong), 0) || 0
                      )}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748b' }}>Phí vận chuyển</span>
                    <span style={{ color: '#334155' }}>{formatCurrency(selectedOrder.phiVanChuyen)}</span>
                  </div>
                  <div style={{ 
                    display: 'flex', justifyContent: 'space-between',
                    paddingTop: '14px', borderTop: '1px solid #e2e8f0',
                    fontSize: '1.1rem', fontWeight: 800
                  }}>
                    <span style={{ color: '#0f172a' }}>Tổng cộng</span>
                    <span style={{ color: '#6366f1' }}>{formatCurrency(selectedOrder.tongTien)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showCreateModal && (
        <OrderCreateModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={() => {
            setShowCreateModal(false);
            fetchOrders();
          }} 
        />
      )}

          </div>
</div>
  );
};

export default OrderManagement;
