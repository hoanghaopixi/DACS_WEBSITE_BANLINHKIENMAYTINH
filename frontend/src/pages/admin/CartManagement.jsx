import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaEye, FaTimes, FaShoppingCart, FaTrash, FaUser, FaBoxOpen } from 'react-icons/fa';
import api from '../../services/api';
import '../../styles/pages/CommonAdmin.css';

const CartManagement = () => {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showDetail, setShowDetail] = useState(null);

  useEffect(() => { fetchCarts(); }, []);

  const fetchCarts = async () => {
    try {
      setLoading(true);
      const res = await api.get('gio-hang');
      if (res.data?.code === 200) setCarts(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredCarts = useMemo(() => {
    let list = carts;
    if (searchTerm.trim()) {
      const t = searchTerm.trim().toLowerCase();
      list = list.filter(c =>
        c.khachHang?.hoTen?.toLowerCase().includes(t) ||
        String(c.maGioHang).includes(t) ||
        String(c.khachHang?.maKH).includes(t)
      );
    }
    return list;
  }, [carts, searchTerm]);

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa giỏ hàng này? Tất cả sản phẩm trong giỏ sẽ bị xóa.')) return;
    try {
      await api.delete(`gio-hang/${id}`);
      fetchCarts();
    } catch (e) {
      alert('Lỗi: ' + (e.response?.data?.message || e.message));
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

  const totalItems = carts.reduce((sum, c) => sum + (c.chiTietGioHangs?.length || 0), 0);

  return (
    <div className="admin-page">
      <div className="admin-header-flex">
        <h1 className="admin-title">Quản lý giỏ hàng</h1>
      </div>

      <div className="admin-page-body">

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}><FaShoppingCart />Số giỏ hàng</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>{carts.length}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}><FaBoxOpen />Tổng SP trong giỏ</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#6366f1' }}>{totalItems}</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="table-actions" style={{ marginBottom: '24px' }}>
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm theo tên KH, mã giỏ..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Mã giỏ</th>
                <th>Khách hàng</th>
                <th>Số SP</th>
                <th>Ngày tạo</th>
                <th style={{ width: 120 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</td></tr>
              ) : filteredCarts.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Chưa có giỏ hàng nào</td></tr>
              ) : filteredCarts.map(c => (
                <tr key={c.maGioHang}>
                  <td style={{ fontWeight: 600 }}>#{c.maGioHang}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FaUser style={{ color: '#94a3b8', fontSize: '0.9rem' }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.khachHang?.hoTen || 'Ẩn danh'}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>MaKH: {c.khachHang?.maKH || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                      background: '#e0f2fe', color: '#0369a1'
                    }}>
                      {c.chiTietGioHangs?.length || 0} sản phẩm
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{formatDate(c.ngayTao)}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon btn-edit" title="Xem chi tiết" onClick={() => setShowDetail(c)}>
                        <FaEye />
                      </button>
                      <button className="btn-icon btn-delete" title="Xóa giỏ" onClick={() => handleDelete(c.maGioHang)}>
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {showDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          onClick={() => setShowDetail(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 650, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.15rem', margin: 0 }}>
                Giỏ hàng #{showDetail.maGioHang} — {showDetail.khachHang?.hoTen || 'Ẩn danh'}
              </h2>
              <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#64748b' }}><FaTimes /></button>
            </div>
            <div style={{ padding: 24, overflowY: 'auto' }}>
              {(!showDetail.chiTietGioHangs || showDetail.chiTietGioHangs.length === 0) ? (
                <div style={{ textAlign: 'center', padding: 30, color: '#94a3b8' }}>Giỏ hàng trống</div>
              ) : (
                <table className="admin-table" style={{ fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th>Hình</th>
                      <th>Sản phẩm</th>
                      <th style={{ textAlign: 'center' }}>SL</th>
                      <th style={{ textAlign: 'right' }}>Giá bán</th>
                      <th style={{ textAlign: 'right' }}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showDetail.chiTietGioHangs.map((ct, idx) => (
                      <tr key={idx}>
                        <td>
                          {ct.sanPham?.hinhAnh ? (
                            <img src={ct.sanPham.hinhAnh} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                          ) : '—'}
                        </td>
                        <td style={{ fontWeight: 500 }}>{ct.sanPham?.tenSP || '—'}</td>
                        <td style={{ textAlign: 'center' }}>{ct.soLuong}</td>
                        <td style={{ textAlign: 'right' }}>{formatMoney(ct.sanPham?.giaBan)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatMoney((ct.sanPham?.giaBan || 0) * ct.soLuong)}</td>
                      </tr>
                    ))}
                    <tr style={{ background: '#f1f5f9' }}>
                      <td colSpan="4" style={{ textAlign: 'right', fontWeight: 700 }}>TỔNG ƯỚC TÍNH:</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#dc2626', fontSize: '1rem' }}>
                        {formatMoney(showDetail.chiTietGioHangs.reduce((s, ct) => s + (ct.sanPham?.giaBan || 0) * ct.soLuong, 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
          </div>
</div>
  );
};

export default CartManagement;
