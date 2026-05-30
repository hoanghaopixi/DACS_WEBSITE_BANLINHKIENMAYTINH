import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTimes, FaUserTie, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave, FaCalendarAlt, FaVenusMars } from 'react-icons/fa';
import api from '../../services/api';
import '../../styles/pages/CommonAdmin.css';

const emptyForm = {
  hoTen: '',
  chucVu: '',
  luong: '',
  sdt: '',
  email: '',
  diaChi: '',
  ngaySinh: '',
  gioiTinh: 'Khác'
};

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get('nhan-vien');
      if (res.data?.code === 200) setEmployees(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    let list = employees;
    if (genderFilter) {
      list = list.filter(e => e.gioiTinh === genderFilter);
    }
    if (searchTerm.trim()) {
      const t = searchTerm.trim().toLowerCase();
      list = list.filter(e => e.hoTen?.toLowerCase().includes(t) || e.sdt?.includes(t) || e.email?.toLowerCase().includes(t) || String(e.maNV).includes(t));
    }
    return list;
  }, [employees, searchTerm, genderFilter]);

  const openAdd = () => {
    setEditing(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEdit = (e) => {
    setEditing(e);
    setFormData({
      hoTen: e.hoTen || '',
      chucVu: e.chucVu || '',
      luong: e.luong ?? '',
      sdt: e.sdt || '',
      email: e.email || '',
      diaChi: e.diaChi || '',
      ngaySinh: e.ngaySinh || '',
      gioiTinh: e.gioiTinh || 'Khác'
    });
    setShowForm(true);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    try {
      setFormLoading(true);
      if (editing) {
        await api.put(`nhan-vien/${editing.maNV}`, formData);
      } else {
        await api.post('nhan-vien', formData);
      }
      setShowForm(false);
      fetchEmployees();
    } catch (e) {
      alert('Lỗi: ' + (e.response?.data?.message || e.message));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa nhân viên "${name}"?`)) return;
    try {
      await api.delete(`nhan-vien/${id}`);
      fetchEmployees();
    } catch (e) {
      alert('Lỗi: ' + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header-flex">
        <h1 className="admin-title">Quản lý nhân viên</h1>
        <button className="btn-primary" onClick={openAdd}>
          <FaPlus /> Thêm nhân viên
        </button>
      </div>

      <div className="admin-page-body">

      <div className="admin-card">
        <div className="table-actions" style={{ marginBottom: '24px' }}>
          <div className="search-box-wrapper">
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Tìm tên nhân viên, SĐT, Email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              value={genderFilter}
              onChange={e => setGenderFilter(e.target.value)}
              style={{ width: '150px', padding: '10px 14px', borderRadius: '12px' }}
            >
              <option value="">Lọc theo giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Mã</th>
                <th>Họ tên</th>
                <th>Chức vụ</th>
                <th>Giới tính</th>
                <th>SĐT / Email</th>
                <th>Lương</th>
                <th style={{ width: 100 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</td></tr>
              ) : filteredEmployees.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Chưa có dữ liệu</td></tr>
              ) : filteredEmployees.map(e => (
                <tr key={e.maNV}>
                  <td>#{e.maNV}</td>
                  <td style={{ fontWeight: 600 }}>{e.hoTen}</td>
                  <td>{e.chucVu || '—'}</td>
                  <td>
                    <span className={`gender-badge ${e.gioiTinh === 'Nam' ? 'male' : e.gioiTinh === 'Nữ' ? 'female' : 'other'}`}>
                      {e.gioiTinh}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      {e.sdt && <div>{e.sdt}</div>}
                      {e.email && <div style={{ color: '#64748b' }}>{e.email}</div>}
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(e.luong || 0)}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon btn-edit" title="Sửa" onClick={() => openEdit(e)}><FaEdit /></button>
                      <button className="btn-icon btn-delete" title="Xóa" onClick={() => handleDelete(e.maNV, e.hoTen)}><FaTrash /></button>
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
              background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '600px',
              maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
            }}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '22px 28px', borderBottom: '1px solid #e2e8f0',
              position: 'sticky', top: 0, background: '#fff', zIndex: 1
            }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>
                {editing ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
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
                <label className="form-label"><FaUserTie style={{marginRight: 6}}/>Họ và tên *</label>
                <input className="form-input" required value={formData.hoTen}
                  onChange={e => setFormData(p => ({ ...p, hoTen: e.target.value }))} />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label"><FaBriefcase style={{marginRight: 6}}/>Chức vụ</label>
                  <input className="form-input" value={formData.chucVu}
                    onChange={e => setFormData(p => ({ ...p, chucVu: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label"><FaMoneyBillWave style={{marginRight: 6}}/>Lương cơ bản (VND)</label>
                  <input className="form-input" type="number" min="0" value={formData.luong}
                    onChange={e => setFormData(p => ({ ...p, luong: e.target.value }))} />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label"><FaPhone style={{marginRight: 6}}/>Số điện thoại</label>
                  <input className="form-input" type="tel" value={formData.sdt}
                    onChange={e => setFormData(p => ({ ...p, sdt: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label"><FaEnvelope style={{marginRight: 6}}/>Email</label>
                  <input className="form-input" type="email" value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label"><FaCalendarAlt style={{marginRight: 6}}/>Ngày sinh</label>
                  <input className="form-input" type="date" value={formData.ngaySinh}
                    onChange={e => setFormData(p => ({ ...p, ngaySinh: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label"><FaVenusMars style={{marginRight: 6}}/>Giới tính</label>
                  <select className="form-select" value={formData.gioiTinh}
                    onChange={e => setFormData(p => ({ ...p, gioiTinh: e.target.value }))}>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label"><FaMapMarkerAlt style={{marginRight: 6}}/>Địa chỉ</label>
                <input className="form-input" value={formData.diaChi}
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

export default EmployeeManagement;
