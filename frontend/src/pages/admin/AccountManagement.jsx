import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaEdit, FaTimes, FaUserShield, FaToggleOn, FaToggleOff, FaTrash, FaLock, FaUnlock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/authService';
import '../../styles/pages/CommonAdmin.css';

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [nhanViens, setNhanViens] = useState([]);
  const [khachHangs, setKhachHangs] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  const [showEdit, setShowEdit] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  useEffect(() => { 
    fetchAccounts(); 
    fetchNhanViens();
    fetchKhachHangs();
    fetchRoles();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await api.get('tai-khoan');
      if (res.data?.code === 200) setAccounts(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchNhanViens = async () => {
    try {
      const res = await api.get('nhan-vien');
      if (res.data?.code === 200) setNhanViens(res.data.data || []);
    } catch (e) {
      console.error('Lỗi tải danh sách nhân viên', e);
    }
  };

  const fetchKhachHangs = async () => {
    try {
      const res = await api.get('khach-hang');
      if (res.data?.code === 200) setKhachHangs(res.data.data || []);
    } catch (e) {
      console.error('Lỗi tải danh sách khách hàng', e);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get('vai-tro');
      if (res.data?.code === 200) setAllRoles(res.data.data || []);
    } catch (e) {
      console.error('Lỗi tải danh sách vai trò', e);
    }
  };

  const filteredAccounts = useMemo(() => {
    let list = accounts;
    if (statusFilter === 'active') list = list.filter(a => a.trangThai === true);
    if (statusFilter === 'locked') list = list.filter(a => a.trangThai === false);
    if (searchTerm.trim()) {
      const t = searchTerm.trim().toLowerCase();
      list = list.filter(a =>
        a.tenDangNhap?.toLowerCase().includes(t) ||
        a.email?.toLowerCase().includes(t) ||
        a.soDienThoai?.includes(t) ||
        a.khachHang?.hoTen?.toLowerCase().includes(t) ||
        a.nhanVien?.hoTen?.toLowerCase().includes(t) ||
        String(a.maTK).includes(t)
      );
    }
    return list;
  }, [accounts, searchTerm, statusFilter]);

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`tai-khoan/${id}/toggle-status`);
      fetchAccounts();
    } catch (e) {
      alert('Lỗi: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa tài khoản "${name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await api.delete(`tai-khoan/${id}`);
      fetchAccounts();
    } catch (e) {
      alert('Lỗi: ' + (e.response?.data?.message || e.message));
    }
  };

  const openEditModal = (account) => {
    setEditingAccount({
      maTK: account.maTK,
      tenDangNhap: account.tenDangNhap || '',
      email: account.email || '',
      soDienThoai: account.soDienThoai || '',
      trangThai: account.trangThai,
      maKH: account.khachHang?.maKH || '',
      maNV: account.nhanVien?.maNV || '',
      vaiTros: account.vaiTros || [],
      selectedRoleId: (account.vaiTros || []).length > 0 ? account.vaiTros[0].maVaiTro : null,
      ngayTao: account.ngayTao || '',
      khachHangTen: account.khachHang?.hoTen || '',
      nhanVienTen: account.nhanVien?.hoTen || '',
      provider: account.provider || 'local'
    });
    setShowEdit(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingAccount.selectedRoleId) {
      alert('Vui lòng chọn quyền vai trò cho tài khoản!');
      return;
    }

    // Kiểm tra admin tự hạ quyền chính mình
    const currentUser = authService.getStoredUser();
    const isEditingSelf = currentUser && currentUser.maTK === editingAccount.maTK;
    const selectedRole = allRoles.find(r => r.maVaiTro === editingAccount.selectedRoleId);
    const isDemotingSelf = isEditingSelf && selectedRole && selectedRole.tenVaiTro?.toUpperCase() !== 'ADMIN';

    // admin1 (ID=1) không được phép tự hạ quyền
    if (isDemotingSelf && editingAccount.maTK === 1) {
      alert('Tài khoản Admin chính không được phép đổi quyền thành Guest!');
      return;
    }

    if (isDemotingSelf) {
      const confirmed = window.confirm(
        `Bạn đang thay đổi vai trò tài khoản của chính mình thành "${selectedRole.tenVaiTro}".\n\nBạn sẽ bị đăng xuất và không còn quyền Admin nữa.\n\nBạn có chắc chắn?`
      );
      if (!confirmed) return;
    }

    try {
      const payload = {
        email: editingAccount.email,
        soDienThoai: editingAccount.soDienThoai,
        trangThai: editingAccount.trangThai,
        khachHang: editingAccount.maKH ? { maKH: parseInt(editingAccount.maKH) } : null,
        nhanVien: editingAccount.maNV ? { maNV: parseInt(editingAccount.maNV) } : null,
        vaiTros: [{ maVaiTro: editingAccount.selectedRoleId }]
      };
      await api.put(`tai-khoan/${editingAccount.maTK}`, payload);
      setShowEdit(false);

      if (isDemotingSelf) {
        authService.logout();
        navigate('/', { replace: true });
        return;
      }

      fetchAccounts();
      alert('Cập nhật tài khoản thành công!');
    } catch (error) {
      alert('Lỗi khi cập nhật tài khoản: ' + (error.response?.data?.message || error.message));
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getRoles = (vaiTros) => {
    if (!vaiTros || vaiTros.length === 0) return 'Chưa gán';
    return vaiTros.map(v => v.tenVaiTro).join(', ');
  };

  const activeCount = accounts.filter(a => a.trangThai === true).length;
  const lockedCount = accounts.filter(a => a.trangThai === false).length;

  return (
    <div className="admin-page">
      <div className="admin-header-flex">
        <h1 className="admin-title">Quản lý tài khoản</h1>
      </div>

      <div className="admin-page-body">

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Tổng tài khoản</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>{accounts.length}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Đang hoạt động</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#22c55e' }}>{activeCount}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Đã khóa</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#ef4444' }}>{lockedCount}</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="table-actions" style={{ marginBottom: '24px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="search-input-container" style={{ flex: 1, minWidth: 250 }}>
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm username, email, SĐT, tên KH/NV..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ width: '170px', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="locked">Đã khóa</option>
          </select>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>ID</th>
                <th>Tên đăng nhập</th>
                <th>Hồ sơ liên kết</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Vai trò</th>
                <th style={{ minWidth: 100 }}>Trạng thái</th>
                <th style={{ width: 120 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</td></tr>
              ) : filteredAccounts.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>Chưa có dữ liệu</td></tr>
              ) : filteredAccounts.map(a => (
                <tr key={a.maTK}>
                  <td>#{a.maTK}</td>
                  <td style={{ fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.tenDangNhap}>{a.tenDangNhap}</td>
                  <td>
                    {a.khachHang ? (
                        <div style={{fontSize:'0.85rem'}}><span style={{color:'#64748b'}}>KH: </span>{a.khachHang.hoTen}</div>
                    ) : null}
                    {a.nhanVien ? (
                        <div style={{fontSize:'0.85rem'}}><span style={{color:'#10b981'}}>NV: </span>{a.nhanVien.hoTen}</div>
                    ) : null}
                    {!a.khachHang && !a.nhanVien && <span style={{color:'#94a3b8'}}>—</span>}
                  </td>
                  <td style={{ fontSize: '0.85rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.email || ''}>{a.email || '—'}</td>
                  <td>{a.soDienThoai || '—'}</td>
                  <td>
                    <span style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                      background: getRoles(a.vaiTros).includes('Admin') ? '#fef3c7' : '#e0f2fe',
                      color: getRoles(a.vaiTros).includes('Admin') ? '#92400e' : '#0369a1'
                    }}>
                      {getRoles(a.vaiTros)}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                      background: a.trangThai ? '#dcfce7' : '#fee2e2',
                      color: a.trangThai ? '#166534' : '#991b1b',
                      whiteSpace: 'nowrap'
                    }}>
                      {a.trangThai ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon btn-edit" title="Sửa" onClick={() => openEditModal(a)}>
                        <FaEdit />
                      </button>
                      {a.maTK !== 1 && (
                        <button
                          className={`btn-icon ${a.trangThai ? 'btn-delete' : 'btn-edit'}`}
                          title={a.trangThai ? 'Khóa tài khoản' : 'Mở khóa'}
                          onClick={() => handleToggleStatus(a.maTK)}
                        >
                          {a.trangThai ? <FaLock /> : <FaUnlock />}
                        </button>
                      )}
                      {a.maTK !== 1 && (
                        <button className="btn-icon btn-delete" title="Xóa" onClick={() => handleDelete(a.maTK, a.tenDangNhap)}>
                          <FaTrash />
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

      {/* Edit Modal */}
      {showEdit && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h2>Chỉnh sửa Tài khoản #{editingAccount?.maTK}</h2>
              <button className="close-btn" onClick={() => setShowEdit(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Thông tin tài khoản */}
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px', marginBottom: 18, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Thông tin tài khoản</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: '0.85rem' }}>
                    <div><span style={{ color: '#94a3b8' }}>ID:</span> <strong>#{editingAccount.maTK}</strong></div>
                    <div><span style={{ color: '#94a3b8' }}>Username:</span> <strong>{editingAccount.tenDangNhap}</strong></div>
                    <div><span style={{ color: '#94a3b8' }}>Vai trò:</span> <strong>{editingAccount.vaiTros?.map(v => v.tenVaiTro).join(', ') || 'Chưa gán'}</strong></div>
                    <div><span style={{ color: '#94a3b8' }}>Provider:</span> <strong>{editingAccount.provider}</strong></div>
                    <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#94a3b8' }}>Email hiện tại:</span> <strong>{editingAccount.email || '—'}</strong></div>
                    <div><span style={{ color: '#94a3b8' }}>SĐT:</span> <strong>{editingAccount.soDienThoai || '—'}</strong></div>
                    <div><span style={{ color: '#94a3b8' }}>Ngày tạo:</span> <strong>{editingAccount.ngayTao ? new Date(editingAccount.ngayTao).toLocaleDateString('vi-VN') : '—'}</strong></div>
                  </div>
                </div>

                {/* Phân quyền vai trò - chỉ chọn 1 */}
                <div className="form-group">
                  <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>
                    <FaUserShield style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Phân quyền vai trò <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ 
                    display: 'flex', flexWrap: 'wrap', gap: '10px',
                    background: '#f8fafc', borderRadius: 10, padding: '14px',
                    border: `2px solid ${!editingAccount.selectedRoleId ? '#fca5a5' : '#e2e8f0'}`
                  }}>
                    {allRoles.map(role => {
                      const isSelected = editingAccount.selectedRoleId === role.maVaiTro;
                      return (
                        <label key={role.maVaiTro} style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
                          background: isSelected ? '#dbeafe' : '#fff',
                          border: `2px solid ${isSelected ? '#3b82f6' : '#e2e8f0'}`,
                          transition: 'all 0.2s', fontWeight: isSelected ? 600 : 400,
                          color: isSelected ? '#1d4ed8' : '#475569',
                          fontSize: '0.9rem'
                        }}>
                          <input
                            type="radio"
                            name="roleSelect"
                            checked={isSelected}
                            onChange={() => setEditingAccount({ ...editingAccount, selectedRoleId: role.maVaiTro })}
                            style={{ width: 16, height: 16, accentColor: '#3b82f6' }}
                          />
                          {role.tenVaiTro}
                          {role.moTa && <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: 4 }}>({role.moTa})</span>}
                        </label>
                      );
                    })}
                    {allRoles.length === 0 && <span style={{ color: '#94a3b8' }}>Không có vai trò nào</span>}
                  </div>
                  {!editingAccount.selectedRoleId && (
                    <small style={{ display: 'block', color: '#ef4444', marginTop: 6, fontWeight: 500 }}>
                      ⚠ Vui lòng chọn quyền vai trò cho tài khoản
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label>Liên kết với Khách hàng (Tùy chọn)</label>
                  <select 
                    className="form-select"
                    value={editingAccount.maKH || ''}
                    onChange={(e) => {
                      const selectedKH = khachHangs.find(kh => kh.maKH === parseInt(e.target.value));
                      const hasNV = !!editingAccount.maNV;
                      setEditingAccount({
                        ...editingAccount, 
                        maKH: e.target.value,
                        // Chỉ đồng bộ email/sdt từ KH khi không có NV
                        email: !hasNV && selectedKH ? (selectedKH.email || editingAccount.email) : editingAccount.email,
                        soDienThoai: !hasNV && selectedKH ? (selectedKH.sdt || editingAccount.soDienThoai) : editingAccount.soDienThoai
                      });
                    }}
                  >
                    <option value="">-- Không liên kết khách hàng --</option>
                    {khachHangs.map(kh => (
                      <option key={kh.maKH} value={kh.maKH}>
                        {kh.hoTen} {kh.sdt ? `- ${kh.sdt}` : ''} {kh.email ? `- ${kh.email}` : ''}
                      </option>
                    ))}
                  </select>
                  <small style={{display:'block', color:'#64748b', marginTop: 4}}>Khi chỉ có KH (không có NV), thông tin KH sẽ hiển thị trên tài khoản.</small>
                </div>

                <div className="form-group">
                  <label>Liên kết với Nhân viên (Tùy chọn)</label>
                  <select 
                    className="form-select"
                    value={editingAccount.maNV || ''}
                    onChange={(e) => {
                      const selectedNV = nhanViens.find(nv => nv.maNV === parseInt(e.target.value));
                      if (selectedNV) {
                        // NV ưu tiên: ghi đè email/sdt
                        setEditingAccount({
                          ...editingAccount, 
                          maNV: e.target.value,
                          email: selectedNV.email || editingAccount.email,
                          soDienThoai: selectedNV.sdt || editingAccount.soDienThoai
                        });
                      } else {
                        // Bỏ NV → fallback về KH nếu có
                        const linkedKH = khachHangs.find(kh => kh.maKH === parseInt(editingAccount.maKH));
                        setEditingAccount({
                          ...editingAccount, 
                          maNV: '',
                          email: linkedKH ? (linkedKH.email || editingAccount.email) : editingAccount.email,
                          soDienThoai: linkedKH ? (linkedKH.sdt || editingAccount.soDienThoai) : editingAccount.soDienThoai
                        });
                      }
                    }}
                  >
                    <option value="">-- Không liên kết nhân viên --</option>
                    {nhanViens.map(nv => (
                      <option key={nv.maNV} value={nv.maNV}>
                        {nv.hoTen} - {nv.chucVu || 'Nhân viên'}
                      </option>
                    ))}
                  </select>
                  <small style={{display:'block', color:'#10b981', marginTop: 4}}>
                    <strong>Ưu tiên cao:</strong> Khi chọn NV, tên NV sẽ hiển thị trên tài khoản thay vì KH.
                  </small>
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editingAccount.email}
                    onChange={(e) => setEditingAccount({...editingAccount, email: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingAccount.soDienThoai}
                    onChange={(e) => setEditingAccount({...editingAccount, soDienThoai: e.target.value})}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <label style={{ margin: 0 }}>Trạng thái hoạt động:</label>
                  <input
                    type="checkbox"
                    checked={editingAccount.trangThai}
                    onChange={(e) => setEditingAccount({...editingAccount, trangThai: e.target.checked})}
                    style={{ width: '20px', height: '20px' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowEdit(false)}>Hủy</button>
                <button type="submit" className="btn-primary">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
          </div>
</div>
  );
};

export default AccountManagement;
