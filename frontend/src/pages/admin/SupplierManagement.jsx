import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTimes, FaBuilding, FaUserTie, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../../services/api';
import '../../styles/pages/CommonAdmin.css';

const emptyForm = {
  tenNCC: '',
  nguoiDaiDien: '',
  diaChi: '',
  sdt: '',
  email: ''
};

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { fetchSuppliers(); }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.get('nha-cung-cap');
      if (res.data?.code === 200) setSuppliers(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = useMemo(() => {
    let list = suppliers;
    if (searchTerm.trim()) {
      const t = searchTerm.trim().toLowerCase();
      list = list.filter(p => p.tenNCC?.toLowerCase().includes(t) || p.sdt?.includes(t) || p.email?.toLowerCase().includes(t) || String(p.maNCC).includes(t));
    }
    return list;
  }, [suppliers, searchTerm]);

  const openAdd = () => {
    setEditing(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setFormData({
      tenNCC: p.tenNCC || '',
      nguoiDaiDien: p.nguoiDaiDien || '',
      diaChi: p.diaChi || '',
      sdt: p.sdt || '',
      email: p.email || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      if (editing) {
        await api.put(`nha-cung-cap/${editing.maNCC}`, formData);
      } else {
        await api.post('nha-cung-cap', formData);
      }
      setShowForm(false);
      fetchSuppliers();
    } catch (e) {
      alert('Lỗi: ' + (e.response?.data?.message || e.message));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa nhà cung cấp "${name}"?`)) return;
    try {
      await api.delete(`nha-cung-cap/${id}`);
      fetchSuppliers();
    } catch (e) {
      alert('Lỗi: ' + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header-flex">
        <h1 className="admin-title">Quản lý nhà cung cấp</h1>
        <button className="btn-primary" onClick={openAdd}>
          <FaPlus /> Thêm nhà cung cấp
        </button>
      </div>

      <div className="admin-page-body">

      <div className="admin-card">
        <div className="table-actions" style={{ marginBottom: '24px' }}>
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm tên NPP, SĐT, Email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>Mã</th>
                <th>Tên nhà cung cấp</th>
                <th>Người đại diện</th>
                <th>Số điện thoại</th>
                <th>Email</th>
                <th>Địa chỉ</th>
                <th style={{ width: 100 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</td></tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Chưa có dữ liệu</td></tr>
              ) : filteredSuppliers.map(p => (
                <tr key={p.maNCC}>
                  <td>#{p.maNCC}</td>
                  <td style={{ fontWeight: 600 }}>{p.tenNCC}</td>
                  <td>{p.nguoiDaiDien || '—'}</td>
                  <td>{p.sdt || '—'}</td>
                  <td>{p.email || '—'}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.diaChi || '—'}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon btn-edit" title="Sửa" onClick={() => openEdit(p)}><FaEdit /></button>
                      <button className="btn-icon btn-delete" title="Xóa" onClick={() => handleDelete(p.maNCC, p.tenNCC)}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
                {editing ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
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
                <label className="form-label"><FaBuilding style={{marginRight: 6}}/>Tên nhà cung cấp *</label>
                <input className="form-input" required value={formData.tenNCC}
                  placeholder="Nhập tên công ty/nhà phân phối"
                  onChange={e => setFormData(p => ({ ...p, tenNCC: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="form-label"><FaUserTie style={{marginRight: 6}}/>Người đại diện</label>
                <input className="form-input" value={formData.nguoiDaiDien}
                  placeholder="Họ tên người liên hệ"
                  onChange={e => setFormData(p => ({ ...p, nguoiDaiDien: e.target.value }))} />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label"><FaPhone style={{marginRight: 6}}/>Số điện thoại</label>
                  <input className="form-input" type="tel" value={formData.sdt}
                    placeholder="VD: 0123456789"
                    onChange={e => setFormData(p => ({ ...p, sdt: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label"><FaEnvelope style={{marginRight: 6}}/>Email</label>
                  <input className="form-input" type="email" value={formData.email}
                    placeholder="VD: email@example.com"
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label"><FaMapMarkerAlt style={{marginRight: 6}}/>Địa chỉ</label>
                <input className="form-input" value={formData.diaChi}
                  placeholder="Nhập địa chỉ đầy đủ"
                  onChange={e => setFormData(p => ({ ...p, diaChi: e.target.value }))} />
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

export default SupplierManagement;
