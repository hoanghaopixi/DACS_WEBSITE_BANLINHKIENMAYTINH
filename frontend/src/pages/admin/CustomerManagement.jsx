import React, { useState, useEffect, useMemo } from 'react';
import {
  FaSearch, FaEye, FaTrash, FaPlus, FaTimes, FaUser,
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaBirthdayCake, FaEdit
} from 'react-icons/fa';
import api from '../../services/api';
import '../../styles/pages/CommonAdmin.css';

const GENDER_OPTIONS = ['Nam', 'Nữ', 'Khác'];

const emptyForm = {
  hoTen: '', sdt: '', email: '', diaChi: '',
  ngaySinh: '', gioiTinh: 'Khác'
};

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('');

  // Detail popup
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Edit / Add modal
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null); // null = add mode
  const [formData, setFormData] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('khach-hang');
      if (res.data?.code === 200) setCustomers(res.data.data);
    } catch (e) {
      console.error('Lỗi tải khách hàng:', e);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (customer) => {
    setSelectedCustomer(customer);
    setDetailLoading(true);
    try {
      const res = await api.get(`don-hang/khach-hang/${customer.maKH}`);
      if (res.data?.code === 200) setCustomerOrders(res.data.data || []);
    } catch {
      setCustomerOrders([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const openAdd = () => {
    setEditingCustomer(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      hoTen: customer.hoTen || '',
      sdt: customer.sdt || '',
      email: customer.email || '',
      diaChi: customer.diaChi || '',
      ngaySinh: customer.ngaySinh || '',
      gioiTinh: customer.gioiTinh || 'Khác'
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      if (editingCustomer) {
        await api.put(`khach-hang/${editingCustomer.maKH}`, formData);
        alert('Cập nhật thành công!');
      } else {
        await api.post('khach-hang', formData);
        alert('Thêm khách hàng thành công!');
      }
      setShowForm(false);
      fetchCustomers();
    } catch (e) {
      alert('Lỗi: ' + (e.response?.data?.message || e.message));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa khách hàng "${name}"?`)) return;
    try {
      await api.delete(`khach-hang/${id}`);
      fetchCustomers();
    } catch (e) {
      alert('Lỗi khi xóa: ' + (e.response?.data?.message || e.message));
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (v) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

  const getTotalSpent = (orders) =>
    orders.filter(o => o.trangThai !== 'Đã hủy').reduce((s, o) => s + Number(o.tongTien || 0), 0);

  const filteredCustomers = useMemo(() => {
    let list = customers;
    if (genderFilter) list = list.filter(c => c.gioiTinh === genderFilter);
    if (searchTerm.trim()) {
      const t = searchTerm.trim().toLowerCase();
      list = list.filter(c =>
        (c.hoTen || '').toLowerCase().includes(t) ||
        (c.sdt || '').includes(t) ||
        (c.email || '').toLowerCase().includes(t)
      );
    }
    return list;
  }, [customers, searchTerm, genderFilter]);

  const genderBadge = (g) => {
    const map = { Nam: { bg: '#dbeafe', color: '#2563eb' }, Nữ: { bg: '#fce7f3', color: '#db2777' } };
    const s = map[g] || { bg: '#f1f5f9', color: '#64748b' };
    return (
      <span style={{
        background: s.bg, color: s.color, padding: '3px 10px',
        borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700
      }}>{g || 'Khác'}</span>
    );
  };

  return (
    <div className="admin-page">
      {/* ─── Header ─── */}
      <div className="admin-header-flex">
        <h1 className="admin-title">Quản lý khách hàng</h1>
        <button className="btn-primary" onClick={openAdd}>
          <FaPlus /> Thêm khách hàng
        </button>
      </div>

      <div className="admin-page-body">

      {/* ─── Table Card ─── */}
      <div className="admin-card">
        {/* Search / Filter */}
        <div className="table-actions" style={{ marginBottom: '24px' }}>
          <div className="search-box-wrapper">
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Tìm tên, SĐT, email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              value={genderFilter}
              onChange={e => setGenderFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '150px', padding: '10px 14px', borderRadius: '12px' }}
            >
              <option value="">Tất cả giới tính</option>
              {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>Mã KH</th>
                <th>Họ tên</th>
                <th>SĐT</th>
                <th>Email</th>
                <th style={{ width: 90 }}>Giới tính</th>
                <th style={{ width: 110 }}>Ngày sinh</th>
                <th style={{ width: 100 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                  {searchTerm || genderFilter ? 'Không tìm thấy khách hàng.' : 'Chưa có khách hàng nào.'}
                </td></tr>
              ) : filteredCustomers.map(c => (
                <tr key={c.maKH}>
                  <td>#{c.maKH}</td>
                  <td style={{ fontWeight: 600 }}>{c.hoTen}</td>
                  <td>{c.sdt || '—'}</td>
                  <td style={{ color: '#6366f1', fontSize: '0.85rem' }}>{c.email || '—'}</td>
                  <td>{genderBadge(c.gioiTinh)}</td>
                  <td>{formatDate(c.ngaySinh)}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon btn-edit" title="Xem chi tiết" onClick={() => openDetail(c)}><FaEye /></button>
                      <button className="btn-icon" title="Chỉnh sửa" onClick={() => openEdit(c)}
                        style={{ color: '#0ea5e9' }}><FaEdit /></button>
                      <button className="btn-icon btn-delete" title="Xóa" onClick={() => handleDelete(c.maKH, c.hoTen)}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Detail Modal ─── */}
      {selectedCustomer && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: '20px'
          }}
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '680px',
              maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
            }}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '22px 28px', borderBottom: '1px solid #e2e8f0',
              position: 'sticky', top: 0, background: '#fff', zIndex: 1
            }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>
                Hồ sơ khách hàng
              </h2>
              <button
                onClick={() => setSelectedCustomer(null)}
                style={{
                  background: '#f1f5f9', border: 'none', borderRadius: '50%',
                  width: 36, height: 36, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: '#64748b'
                }}
              ><FaTimes /></button>
            </div>

            <div style={{ padding: '24px 28px' }}>
              {/* Avatar + Basic Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FaUser size={28} color="#fff" />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px', color: '#0f172a', fontSize: '1.15rem' }}>
                    {selectedCustomer.hoTen}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {genderBadge(selectedCustomer.gioiTinh)}
                  </div>
                </div>
              </div>

              {/* Contact Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                {[
                  { icon: <FaPhone color="#6366f1" />, label: 'Số điện thoại', value: selectedCustomer.sdt || '—' },
                  { icon: <FaEnvelope color="#6366f1" />, label: 'Email', value: selectedCustomer.email || '—' },
                  { icon: <FaBirthdayCake color="#f59e0b" />, label: 'Ngày sinh', value: formatDate(selectedCustomer.ngaySinh) },
                  { icon: <FaMapMarkerAlt color="#ef4444" />, label: 'Địa chỉ', value: selectedCustomer.diaChi || '—' },
                ].map((item, i) => (
                  <div key={i} style={{
                    background: '#f8fafc', borderRadius: '12px', padding: '14px 16px',
                    border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '10px'
                  }}>
                    <span style={{ marginTop: 2 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2px' }}>{item.label}</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Orders Section */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                    Lịch sử đơn hàng
                  </span>
                  {!detailLoading && (
                    <span style={{
                      background: '#e0e7ff', color: '#4338ca', padding: '2px 10px',
                      borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700
                    }}>
                      {customerOrders.length} đơn
                    </span>
                  )}
                </div>

                {detailLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Đang tải...</div>
                ) : customerOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    Khách hàng chưa có đơn hàng nào.
                  </div>
                ) : (
                  <>
                    {/* Summary bar */}
                    <div style={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      borderRadius: '12px', padding: '16px 20px', marginBottom: '14px',
                      display: 'flex', justifyContent: 'space-between', color: '#fff'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{customerOrders.length}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Tổng đơn</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                          {customerOrders.filter(o => o.trangThai === 'Hoàn thành').length}
                        </div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Hoàn thành</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                          {formatCurrency(getTotalSpent(customerOrders))}
                        </div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Tổng chi tiêu</div>
                      </div>
                    </div>

                    {/* Order list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                      {customerOrders.map(order => {
                        const statusMap = {
                          'Hoàn thành': { bg: '#dcfce7', color: '#16a34a' },
                          'Đã hủy': { bg: '#fee2e2', color: '#dc2626' },
                          'Đang giao': { bg: '#dbeafe', color: '#2563eb' },
                        };
                        const s = statusMap[order.trangThai] || { bg: '#fef3c7', color: '#d97706' };
                        return (
                          <div key={order.maDonHang} style={{
                            background: '#f8fafc', borderRadius: '10px', padding: '12px 16px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            border: '1px solid #e2e8f0'
                          }}>
                            <div>
                              <span style={{ fontWeight: 700, color: '#334155', fontSize: '0.875rem' }}>
                                #{order.maDonHang}
                              </span>
                              <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '8px' }}>
                                {formatDate(order.ngayDat)}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontWeight: 700, color: '#6366f1', fontSize: '0.875rem' }}>
                                {formatCurrency(order.tongTien)}
                              </span>
                              <span style={{
                                background: s.bg, color: s.color,
                                padding: '3px 10px', borderRadius: '9999px',
                                fontSize: '0.73rem', fontWeight: 700
                              }}>
                                {order.trangThai}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Add / Edit Form Modal ─── */}
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
              background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '540px',
              maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
            }}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '22px 28px', borderBottom: '1px solid #e2e8f0',
              position: 'sticky', top: 0, background: '#fff', zIndex: 1
            }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>
                {editingCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: '#f1f5f9', border: 'none', borderRadius: '50%',
                  width: 36, height: 36, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b'
                }}
              ><FaTimes /></button>
            </div>

            <form onSubmit={handleSubmit} className="admin-form" style={{ padding: '24px 28px' }}>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Họ tên *</label>
                  <input className="form-input" required value={formData.hoTen}
                    onChange={e => setFormData(p => ({ ...p, hoTen: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input className="form-input" value={formData.sdt}
                    onChange={e => setFormData(p => ({ ...p, sdt: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Giới tính</label>
                  <select className="form-select" value={formData.gioiTinh}
                    onChange={e => setFormData(p => ({ ...p, gioiTinh: e.target.value }))}>
                    {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày sinh</label>
                  <input type="date" className="form-input" value={formData.ngaySinh}
                    onChange={e => setFormData(p => ({ ...p, ngaySinh: e.target.value }))} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Địa chỉ</label>
                  <input className="form-input" value={formData.diaChi}
                    onChange={e => setFormData(p => ({ ...p, diaChi: e.target.value }))} />
                </div>

              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit" className="btn-primary" disabled={formLoading}>
                  {formLoading ? 'Đang xử lý...' : (editingCustomer ? 'Cập nhật' : 'Thêm mới')}
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

export default CustomerManagement;
