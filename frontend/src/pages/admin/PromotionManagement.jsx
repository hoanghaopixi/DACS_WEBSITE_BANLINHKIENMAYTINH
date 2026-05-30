import React, { useState, useEffect, useMemo } from 'react';
import {
  FaSearch, FaPlus, FaEdit, FaTrash, FaTimes, FaTag,
  FaCalendarAlt, FaPercent, FaCheckCircle, FaClock, FaBan
} from 'react-icons/fa';
import api from '../../services/api';
import '../../styles/pages/CommonAdmin.css';

const emptyForm = {
  tenKM: '',
  phanTramGiam: '',
  ngayBatDau: '',
  ngayKetThuc: '',
  dieuKienApDung: ''
};

// Format datetime-local input to ISO string for API
const toISO = (dtLocal) => dtLocal ? dtLocal + ':00' : null;
// Format ISO string to datetime-local input value
const toLocalInput = (iso) => {
  if (!iso) return '';
  return iso.substring(0, 16); // "YYYY-MM-DDTHH:mm"
};

const PromotionManagement = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // 'active' | 'expired' | 'upcoming'

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { fetchPromos(); }, []);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const res = await api.get('khuyen-mai');
      if (res.data?.code === 200) setPromos(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (promo) => {
    const now = new Date();
    const start = new Date(promo.ngayBatDau);
    const end = new Date(promo.ngayKetThuc);
    if (now < start) return 'upcoming';
    if (now > end) return 'expired';
    return 'active';
  };

  const statusConfig = {
    active:   { label: 'Đang diễn ra', bg: '#dcfce7', color: '#16a34a', icon: <FaCheckCircle size={11} /> },
    upcoming: { label: 'Sắp diễn ra', bg: '#fef3c7', color: '#d97706', icon: <FaClock size={11} /> },
    expired:  { label: 'Đã hết hạn',  bg: '#fee2e2', color: '#dc2626', icon: <FaBan size={11} /> },
  };

  const filteredPromos = useMemo(() => {
    let list = promos;
    if (statusFilter) list = list.filter(p => getStatus(p) === statusFilter);
    if (searchTerm.trim()) {
      const t = searchTerm.trim().toLowerCase();
      list = list.filter(p => p.tenKM?.toLowerCase().includes(t) || String(p.maKM).includes(t));
    }
    return list;
  }, [promos, searchTerm, statusFilter]);

  const openAdd = () => {
    setEditing(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setFormData({
      tenKM: p.tenKM || '',
      phanTramGiam: p.phanTramGiam ?? '',
      ngayBatDau: toLocalInput(p.ngayBatDau),
      ngayKetThuc: toLocalInput(p.ngayKetThuc),
      dieuKienApDung: p.dieuKienApDung || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(formData.phanTramGiam) < 0 || Number(formData.phanTramGiam) > 100) {
      alert('Phần trăm giảm phải từ 0 đến 100.');
      return;
    }
    if (new Date(formData.ngayBatDau) >= new Date(formData.ngayKetThuc)) {
      alert('Ngày kết thúc phải sau ngày bắt đầu.');
      return;
    }
    try {
      setFormLoading(true);
      const payload = {
        tenKM: formData.tenKM,
        phanTramGiam: Number(formData.phanTramGiam),
        ngayBatDau: toISO(formData.ngayBatDau),
        ngayKetThuc: toISO(formData.ngayKetThuc),
        dieuKienApDung: formData.dieuKienApDung
      };
      if (editing) {
        await api.put(`khuyen-mai/${editing.maKM}`, payload);
        alert('Cập nhật thành công!');
      } else {
        await api.post('khuyen-mai', payload);
        alert('Thêm khuyến mãi thành công!');
      }
      setShowForm(false);
      fetchPromos();
    } catch (e) {
      alert('Lỗi: ' + (e.response?.data?.message || e.message));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa khuyến mãi "${name}"?`)) return;
    try {
      await api.delete(`khuyen-mai/${id}`);
      fetchPromos();
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

  // Summary counts
  const counts = useMemo(() => ({
    active:   promos.filter(p => getStatus(p) === 'active').length,
    upcoming: promos.filter(p => getStatus(p) === 'upcoming').length,
    expired:  promos.filter(p => getStatus(p) === 'expired').length,
  }), [promos]);

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header-flex">
        <h1 className="admin-title">Quản lý khuyến mãi</h1>
        <button className="btn-primary" onClick={openAdd}>
          <FaPlus /> Thêm khuyến mãi
        </button>
      </div>

      <div className="admin-page-body">

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { key: 'active', label: 'Đang diễn ra', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
          { key: 'upcoming', label: 'Sắp diễn ra', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
          { key: 'expired', label: 'Đã hết hạn', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
        ].map(c => (
          <div
            key={c.key}
            onClick={() => setStatusFilter(statusFilter === c.key ? '' : c.key)}
            style={{
              background: statusFilter === c.key ? c.bg : '#fff',
              border: `2px solid ${statusFilter === c.key ? c.border : '#e2e8f0'}`,
              borderRadius: '14px', padding: '18px 22px', cursor: 'pointer',
              transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: c.color }}>{counts[c.key]}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>{c.label}</div>
            </div>
            <FaTag size={28} color={c.border} />
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="admin-card">
        <div className="table-actions" style={{ marginBottom: '24px' }}>
          <div className="search-box-wrapper">
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Tìm tên khuyến mãi, mã KM..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '170px', padding: '10px 14px', borderRadius: '12px' }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang diễn ra</option>
              <option value="upcoming">Sắp diễn ra</option>
              <option value="expired">Đã hết hạn</option>
            </select>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>Mã KM</th>
                <th>Tên khuyến mãi</th>
                <th style={{ width: 90 }}>Giảm (%)</th>
                <th style={{ width: 160 }}>Bắt đầu</th>
                <th style={{ width: 160 }}>Kết thúc</th>
                <th style={{ width: 150 }}>Trạng thái</th>
                <th>Điều kiện</th>
                <th style={{ width: 100 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</td></tr>
              ) : filteredPromos.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                  {searchTerm || statusFilter ? 'Không tìm thấy khuyến mãi.' : 'Chưa có khuyến mãi nào.'}
                </td></tr>
              ) : filteredPromos.map(p => {
                const st = getStatus(p);
                const sc = statusConfig[st];
                return (
                  <tr key={p.maKM}>
                    <td>#{p.maKM}</td>
                    <td style={{ fontWeight: 600 }}>{p.tenKM}</td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        background: '#e0e7ff', color: '#4338ca',
                        padding: '4px 12px', borderRadius: '9999px',
                        fontWeight: 700, fontSize: '0.875rem'
                      }}>
                        {p.phanTramGiam} %
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#475569' }}>{formatDate(p.ngayBatDau)}</td>
                    <td style={{ fontSize: '0.85rem', color: '#475569' }}>{formatDate(p.ngayKetThuc)}</td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        background: sc.bg, color: sc.color,
                        padding: '4px 10px', borderRadius: '9999px',
                        fontWeight: 700, fontSize: '0.75rem'
                      }}>
                        {sc.icon}{sc.label}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.dieuKienApDung || '—'}
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-icon btn-edit" title="Sửa" onClick={() => openEdit(p)}><FaEdit /></button>
                        <button className="btn-icon btn-delete" title="Xóa" onClick={() => handleDelete(p.maKM, p.tenKM)}><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: '20px'
          }}
          onClick={() => setShowForm(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '520px',
              maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
            }}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '22px 28px', borderBottom: '1px solid #e2e8f0',
              position: 'sticky', top: 0, background: '#fff', zIndex: 1
            }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>
                {editing ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: '#f1f5f9', border: 'none', borderRadius: '50%',
                  width: 36, height: 36, cursor: 'pointer', color: '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              ><FaTimes /></button>
            </div>

            <form onSubmit={handleSubmit} className="admin-form" style={{ padding: '24px 28px' }}>
              <div className="form-group">
                <label className="form-label">Tên khuyến mãi *</label>
                <input className="form-input" required value={formData.tenKM}
                  placeholder="VD: Giảm 20% dịp lễ 30/4"
                  onChange={e => setFormData(p => ({ ...p, tenKM: e.target.value }))} />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px' }}>
                <div className="form-group">
                  <label className="form-label">Phần trăm giảm (%) *</label>
                  <input className="form-input" type="number" required min="0" max="100" step="0.01"
                    value={formData.phanTramGiam} placeholder="VD: 20"
                    onChange={e => setFormData(p => ({ ...p, phanTramGiam: e.target.value }))} />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Ngày bắt đầu *</label>
                  <input className="form-input" type="datetime-local" required
                    value={formData.ngayBatDau}
                    onChange={e => setFormData(p => ({ ...p, ngayBatDau: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày kết thúc *</label>
                  <input className="form-input" type="datetime-local" required
                    value={formData.ngayKetThuc}
                    onChange={e => setFormData(p => ({ ...p, ngayKetThuc: e.target.value }))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Điều kiện áp dụng</label>
                <textarea className="form-textarea" rows={3}
                  value={formData.dieuKienApDung}
                  placeholder="VD: Áp dụng cho đơn hàng từ 1.000.000đ trở lên"
                  onChange={e => setFormData(p => ({ ...p, dieuKienApDung: e.target.value }))}
                  style={{ height: 80 }}
                />
              </div>

              <div style={{
                display: 'flex', gap: '12px', justifyContent: 'flex-end',
                marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '20px'
              }}>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit" className="btn-primary" disabled={formLoading}>
                  {formLoading ? 'Đang xử lý...' : (editing ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
          </div>
</div>
  );
};

export default PromotionManagement;
