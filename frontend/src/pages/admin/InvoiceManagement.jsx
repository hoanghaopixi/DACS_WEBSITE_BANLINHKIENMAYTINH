import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaEdit, FaTimes, FaFileInvoice, FaMoneyBillWave, FaCheckCircle, FaClock, FaPrint } from 'react-icons/fa';
import api from '../../services/api';
import InvoicePrintModal from '../../components/admin/InvoicePrintModal';
import '../../styles/pages/CommonAdmin.css';

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  const [showEdit, setShowEdit] = useState(null);
  const [editData, setEditData] = useState({ trangThaiThanhToan: '', hinhThucThanhToan: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [printInvoice, setPrintInvoice] = useState(null);
  const [vnpayResult, setVnpayResult] = useState(null);

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('hoa-don');
      if (res.data?.code === 200) setInvoices(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = useMemo(() => {
    let list = invoices;
    if (paymentFilter) list = list.filter(hd => hd.trangThaiThanhToan === paymentFilter);
    if (searchTerm.trim()) {
      const t = searchTerm.trim().toLowerCase();
      list = list.filter(hd =>
        String(hd.maHoaDon).includes(t) ||
        String(hd.donHang?.maDonHang).includes(t) ||
        hd.donHang?.khachHang?.hoTen?.toLowerCase().includes(t)
      );
    }
    return list;
  }, [invoices, searchTerm, paymentFilter]);

  const openEdit = (hd) => {
    setShowEdit(hd);
    setEditData({
      trangThaiThanhToan: hd.trangThaiThanhToan || 'Chưa thanh toán',
      hinhThucThanhToan: hd.hinhThucThanhToan || 'Tiền mặt'
    });
  };

  const handleSubmitEdit = async () => {
    try {
      setEditLoading(true);
      await api.put(`hoa-don/${showEdit.maHoaDon}`, editData);
      setShowEdit(null);
      fetchInvoices();
    } catch (e) {
      alert('Lỗi: ' + (e.response?.data?.message || e.message));
    } finally {
      setEditLoading(false);
    }
  };

  // Listen for VNPay popup result
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'VNPAY_RESULT') {
        setVnpayResult(event.data);
        fetchInvoices();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleVNPayPayment = async (hd) => {
    try {
      const vnpayRes = await api.get('vnpay/create-payment', {
         params: {
            amount: hd.tongTien,
            orderInfo: 'Thanh toan hoa don HD_' + hd.maHoaDon,
            txnRef: 'HD_' + hd.maHoaDon
         }
      });
      if (vnpayRes.data && vnpayRes.data.url) {
         const w = 1280, h = 720;
         const left = (screen.width - w) / 2;
         const top = (screen.height - h) / 2;
         const popup = window.open(
           vnpayRes.data.url,
           'vnpay_popup',
           `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes`
         );
         // Poll to detect if user closed popup without completing payment
         const timer = setInterval(() => {
           if (popup && popup.closed) {
             clearInterval(timer);
             fetchInvoices();
           }
         }, 1000);
      }
    } catch (e) {
      console.error('Lỗi tạo link VNPay:', e);
      alert('Không thể tạo link thanh toán VNPay');
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const paidCount = invoices.filter(hd => hd.trangThaiThanhToan === 'Đã thanh toán').length;
  const unpaidCount = invoices.filter(hd => hd.trangThaiThanhToan !== 'Đã thanh toán').length;
  const totalRevenue = invoices.filter(hd => hd.trangThaiThanhToan === 'Đã thanh toán')
    .reduce((sum, hd) => sum + (hd.tongTien || 0), 0);

  return (
    <div className="admin-page">
      <div className="admin-header-flex">
        <h1 className="admin-title">Quản lý hóa đơn</h1>
      </div>

      <div className="admin-page-body">

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}><FaFileInvoice />Tổng hóa đơn</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>{invoices.length}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}><FaCheckCircle />Đã thanh toán</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#22c55e' }}>{paidCount}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}><FaClock />Chưa thanh toán</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f59e0b' }}>{unpaidCount}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}><FaMoneyBillWave />Doanh thu thu được</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#dc2626' }}>{formatMoney(totalRevenue)}</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="table-actions" style={{ marginBottom: '24px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="search-input-container" style={{ flex: 1, minWidth: 250 }}>
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm mã HD, mã ĐH, tên KH..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
            style={{ width: '200px', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
          >
            <option value="">Tất cả trạng thái TT</option>
            <option value="Đã thanh toán">Đã thanh toán</option>
            <option value="Chưa thanh toán">Chưa thanh toán</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Mã HĐ</th>
                <th>Đơn hàng</th>
                <th>Khách hàng</th>
                <th>Nhân viên duyệt</th>
                <th>Ngày lập</th>
                <th>Tổng tiền</th>
                <th>Khuyến mãi</th>
                <th>Hình thức TT</th>
                <th style={{ minWidth: 120, textAlign: 'center' }}>Trạng thái TT</th>
                <th>Chi tiết VNPay</th>
                <th style={{ width: 100 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</td></tr>
              ) : filteredInvoices.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>Chưa có dữ liệu</td></tr>
              ) : filteredInvoices.map(hd => (
                <tr key={hd.maHoaDon}>
                  <td style={{ fontWeight: 600 }}>#{hd.maHoaDon}</td>
                  <td>#{hd.donHang?.maDonHang || '—'}</td>
                  <td>{hd.donHang?.khachHang?.hoTen || '—'}</td>
                  <td>{hd.nhanVien?.hoTen || 'Hệ thống'}</td>
                  <td style={{ fontSize: '0.82rem' }}>{formatDate(hd.ngayLap)}</td>
                  <td style={{ fontWeight: 600, color: '#dc2626' }}>{formatMoney(hd.tongTien)}</td>
                  <td>{hd.khuyenMai > 0 ? formatMoney(hd.khuyenMai) : '—'}</td>
                  <td>{hd.hinhThucThanhToan}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                      whiteSpace: 'nowrap', display: 'inline-block',
                      background: hd.trangThaiThanhToan === 'Đã thanh toán' ? '#dcfce7' : hd.trangThaiThanhToan === 'Đã hủy' ? '#fee2e2' : '#fef3c7',
                      color: hd.trangThaiThanhToan === 'Đã thanh toán' ? '#166534' : hd.trangThaiThanhToan === 'Đã hủy' ? '#dc2626' : '#92400e'
                    }}>
                      {hd.trangThaiThanhToan}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {hd.vnpTransactionNo ? (
                       <>
                         Mã GD: <strong>{hd.vnpTransactionNo}</strong><br/>
                         NH: {hd.vnpBankCode}
                       </>
                    ) : '—'}
                  </td>
                  <td>
                    <div className="action-btns" style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-icon btn-edit" title="Cập nhật thanh toán" onClick={() => openEdit(hd)}>
                        <FaEdit />
                      </button>
                      {hd.trangThaiThanhToan === 'Đã thanh toán' && (
                        <button className="btn-icon" title="In hóa đơn" onClick={() => setPrintInvoice(hd)}
                          style={{ color: '#6366f1' }}>
                          <FaPrint />
                        </button>
                      )}
                      {hd.trangThaiThanhToan !== 'Đã thanh toán' && hd.trangThaiThanhToan !== 'Đã hủy' && (
                         <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '6px' }} title="Tạo link VNPay" onClick={() => handleVNPayPayment(hd)}>
                           VNPay
                         </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEdit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          onClick={() => setShowEdit(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 450, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 28px', borderBottom: '1px solid #e2e8f0' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Cập nhật hóa đơn #{showEdit.maHoaDon}</h2>
              <button onClick={() => setShowEdit(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaTimes />
              </button>
            </div>
            <div style={{ padding: '24px 28px' }}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Trạng thái thanh toán</label>
                <select className="form-select" value={editData.trangThaiThanhToan}
                  onChange={e => setEditData(p => ({ ...p, trangThaiThanhToan: e.target.value }))}>
                  <option value="Chưa thanh toán">Chưa thanh toán</option>
                  <option value="Đã thanh toán">Đã thanh toán</option>
                  <option value="Đã hủy">Đã hủy</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Hình thức thanh toán</label>
                <select className="form-select" value={editData.hinhThucThanhToan}
                  onChange={e => setEditData(p => ({ ...p, hinhThucThanhToan: e.target.value }))}>
                  <option value="Tiền mặt">Tiền mặt</option>
                  <option value="VNPay">VNPay</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24, borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
                <button className="btn-secondary" onClick={() => setShowEdit(null)}>Hủy</button>
                <button className="btn-primary" disabled={editLoading} onClick={handleSubmitEdit}>
                  {editLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT MODAL */}
      {printInvoice && (
        <InvoicePrintModal invoice={printInvoice} onClose={() => setPrintInvoice(null)} />
      )}

      {/* VNPAY RESULT MODAL */}
      {vnpayResult && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 20 }}
          onClick={() => setVnpayResult(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 20, width: '100%', maxWidth: 420,
            boxShadow: '0 25px 60px rgba(0,0,0,0.2)', textAlign: 'center', overflow: 'hidden',
            animation: 'slideUp 0.3s ease'
          }}>
            <div style={{
              padding: '36px 28px 20px',
              background: vnpayResult.status === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff'
            }}>
              <div style={{ fontSize: 56, marginBottom: 10 }}>
                {vnpayResult.status === 'success' ? '✓' : '✕'}
              </div>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>
                {vnpayResult.status === 'success' ? 'Thanh toán VNPay thành công!' : 'Thanh toán VNPay thất bại!'}
              </h2>
            </div>
            <div style={{ padding: '24px 28px' }}>
              {vnpayResult.status === 'success' ? (
                <div style={{ background: '#f0fdf4', padding: 16, borderRadius: 12, textAlign: 'left', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#475569' }}>Mã hóa đơn:</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{vnpayResult.orderId || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#475569' }}>Mã giao dịch:</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{vnpayResult.transactionId || '—'}</span>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#64748b', margin: '0 0 16px' }}>
                  Giao dịch bị hủy hoặc xảy ra lỗi. Mã tham chiếu: {vnpayResult.orderId || '—'}
                </p>
              )}
              <button
                onClick={() => setVnpayResult(null)}
                style={{
                  padding: '10px 32px', border: 'none', borderRadius: 10, cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.2s',
                  background: vnpayResult.status === 'success' ? '#10b981' : '#6366f1',
                  color: '#fff'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
          </div>
</div>
  );
};

export default InvoiceManagement;
