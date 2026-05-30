import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTimes, FaLink, FaImage, FaCloudUploadAlt } from 'react-icons/fa';
import api from '../../services/api';
import '../../styles/pages/CommonAdmin.css';

const emptyForm = {
  tieuDe: '',
  hinhAnh: '',
  linkRedirect: '',
  linkType: 'url', // 'url' hoặc 'product'
  selectedProductId: null
};

const AdManagement = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Sản phẩm cho chọn link
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  useEffect(() => { fetchAds(); fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('san-pham');
      if (res.data?.code === 200) setProducts(res.data.data || []);
    } catch (e) { console.error(e); }
  };

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products.slice(0, 20);
    const t = productSearch.trim().toLowerCase();
    return products.filter(p =>
      p.tenSP?.toLowerCase().includes(t) || String(p.maSP).includes(t)
    ).slice(0, 20);
  }, [products, productSearch]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const res = await api.get('quang-cao');
      if (res.data?.code === 200) setAds(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredAds = useMemo(() => {
    let list = ads;
    if (searchTerm.trim()) {
      const t = searchTerm.trim().toLowerCase();
      list = list.filter(p => p.tieuDe?.toLowerCase().includes(t) || String(p.maQuangCao).includes(t));
    }
    return list;
  }, [ads, searchTerm]);

  const openAdd = () => {
    setEditing(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    // Detect link type: if link matches /products/ID pattern -> product
    const productMatch = p.linkRedirect?.match(/\/products\/(\d+)/);
    const isProduct = !!productMatch;
    setFormData({
      tieuDe: p.tieuDe || '',
      hinhAnh: p.hinhAnh || '',
      linkRedirect: p.linkRedirect || '',
      linkType: isProduct ? 'product' : 'url',
      selectedProductId: isProduct ? parseInt(productMatch[1]) : null
    });
    setProductSearch('');
    setShowProductDropdown(false);
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh (jpg, png, webp, ...)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Ảnh quá lớn. Vui lòng chọn ảnh dưới 10MB.');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('upload/ad-banner', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const imageUrl = res.data?.data?.url;
      if (imageUrl) {
        setFormData(prev => ({ ...prev, hinhAnh: imageUrl }));
      }
    } catch (err) {
      alert('Upload thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, hinhAnh: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation link đích
    if (formData.linkType === 'url' && !formData.linkRedirect.trim()) {
      alert('Vui lòng nhập link đích cho quảng cáo!');
      return;
    }
    if (formData.linkType === 'product' && !formData.selectedProductId) {
      alert('Vui lòng chọn sản phẩm cho quảng cáo!');
      return;
    }
    try {
      setFormLoading(true);
      if (editing) {
        await api.put(`quang-cao/${editing.maQuangCao}`, formData);
      } else {
        await api.post('quang-cao', formData);
      }
      setShowForm(false);
      fetchAds();
    } catch (e) {
      alert('Lỗi: ' + (e.response?.data?.message || e.message));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Xóa quảng cáo "${title}"?`)) return;
    try {
      await api.delete(`quang-cao/${id}`);
      fetchAds();
    } catch (e) {
      alert('Lỗi: ' + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header-flex">
        <h1 className="admin-title">Quản lý quảng cáo</h1>
        <button className="btn-primary" onClick={openAdd}>
          <FaPlus /> Thêm quảng cáo
        </button>
      </div>

      <div className="admin-page-body">

      <div className="admin-card">
        <div className="table-actions" style={{ marginBottom: '24px' }}>
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, mã..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>Mã QC</th>
                <th style={{ width: 150 }}>Hình ảnh</th>
                <th>Tiêu đề</th>
                <th>Link đích (Redirect)</th>
                <th style={{ width: 100 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</td></tr>
              ) : filteredAds.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Chưa có dữ liệu</td></tr>
              ) : filteredAds.map(p => (
                <tr key={p.maQuangCao}>
                  <td>#{p.maQuangCao}</td>
                  <td>
                    {p.hinhAnh ? (
                      <div style={{ width: 120, height: 60, overflow: 'hidden', borderRadius: 6, background: '#f8fafc' }}>
                        <img src={p.hinhAnh} alt={p.tieuDe} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : '—'}
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.tieuDe}</td>
                  <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.linkRedirect ? <a href={p.linkRedirect} target="_blank" rel="noreferrer" style={{color: '#3b82f6'}}>{p.linkRedirect}</a> : '—'}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon btn-edit" title="Sửa" onClick={() => openEdit(p)}><FaEdit /></button>
                      <button className="btn-icon btn-delete" title="Xóa" onClick={() => handleDelete(p.maQuangCao, p.tieuDe)}><FaTrash /></button>
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
                {editing ? 'Chỉnh sửa quảng cáo' : 'Thêm quảng cáo mới'}
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
                <label className="form-label">Tiêu đề quảng cáo *</label>
                <input className="form-input" required value={formData.tieuDe}
                  placeholder="Nhập tiêu đề (VD: Sale 50% VGA)"
                  onChange={e => setFormData(p => ({ ...p, tieuDe: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="form-label"><FaImage style={{marginRight: 6}}/>Hình ảnh banner *</label>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />

                {formData.hinhAnh ? (
                  /* Preview uploaded image */
                  <div style={{ position: 'relative', marginTop: 8 }}>
                    <div style={{ 
                      borderRadius: 10, overflow: 'hidden', 
                      border: '2px solid #e2e8f0', background: '#f8fafc' 
                    }}>
                      <img 
                        src={formData.hinhAnh} 
                        alt="preview" 
                        style={{ width: '100%', display: 'block', maxHeight: 250, objectFit: 'contain', background: '#f1f5f9' }} 
                      />
                    </div>
                    <div style={{ 
                      display: 'flex', gap: 8, marginTop: 10 
                    }}>
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          flex: 1, padding: '8px 12px', borderRadius: 8,
                          border: '1px solid #e2e8f0', background: '#f8fafc',
                          cursor: 'pointer', fontSize: '0.85rem', color: '#475569',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                        }}
                        disabled={uploading}
                      >
                        <FaCloudUploadAlt /> Đổi ảnh khác
                      </button>
                      <button 
                        type="button"
                        onClick={handleRemoveImage}
                        style={{
                          padding: '8px 16px', borderRadius: 8,
                          border: '1px solid #fecaca', background: '#fef2f2',
                          cursor: 'pointer', fontSize: '0.85rem', color: '#dc2626',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                        }}
                      >
                        <FaTrash /> Xóa
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Upload zone */
                  <div 
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    style={{
                      marginTop: 8, border: '2px dashed #cbd5e1', borderRadius: 12,
                      padding: '32px 20px', textAlign: 'center', cursor: uploading ? 'wait' : 'pointer',
                      background: '#f8fafc', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = '#eff6ff'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
                  >
                    {uploading ? (
                      <>
                        <div style={{ fontSize: '2rem', color: '#3b82f6', marginBottom: 8 }}>⏳</div>
                        <p style={{ margin: 0, color: '#3b82f6', fontWeight: 600 }}>Đang tải lên...</p>
                      </>
                    ) : (
                      <>
                        <FaCloudUploadAlt style={{ fontSize: '2.5rem', color: '#94a3b8', marginBottom: 8 }} />
                        <p style={{ margin: 0, color: '#475569', fontWeight: 600 }}>
                          Nhấn để chọn ảnh banner
                        </p>
                        <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                          JPG, PNG, WEBP — Tối đa 10MB
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ marginBottom: 10 }}>
                  <FaLink style={{marginRight: 6}}/>
                  Link đích (khi click vào quảng cáo) *
                </label>
                
                {/* Radio chọn loại link */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <label style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px 12px', borderRadius: 8, cursor: 'pointer', flex: 1,
                    background: formData.linkType === 'url' ? '#eff6ff' : '#fff',
                    border: `1.5px solid ${formData.linkType === 'url' ? '#3b82f6' : '#e2e8f0'}`,
                    fontSize: '0.82rem', whiteSpace: 'nowrap',
                    color: formData.linkType === 'url' ? '#1d4ed8' : '#64748b',
                    fontWeight: formData.linkType === 'url' ? 600 : 400, transition: 'all 0.2s'
                  }}>
                    <input type="radio" name="linkType" checked={formData.linkType === 'url'}
                      onChange={() => setFormData(p => ({ ...p, linkType: 'url', selectedProductId: null }))}
                      style={{ accentColor: '#3b82f6', margin: 0 }} />
                    Nhập link tùy chỉnh
                  </label>
                  <label style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px 12px', borderRadius: 8, cursor: 'pointer', flex: 1,
                    background: formData.linkType === 'product' ? '#eff6ff' : '#fff',
                    border: `1.5px solid ${formData.linkType === 'product' ? '#3b82f6' : '#e2e8f0'}`,
                    fontSize: '0.82rem', whiteSpace: 'nowrap',
                    color: formData.linkType === 'product' ? '#1d4ed8' : '#64748b',
                    fontWeight: formData.linkType === 'product' ? 600 : 400, transition: 'all 0.2s'
                  }}>
                    <input type="radio" name="linkType" checked={formData.linkType === 'product'}
                      onChange={() => setFormData(p => ({ ...p, linkType: 'product', linkRedirect: '' }))}
                      style={{ accentColor: '#3b82f6', margin: 0 }} />
                    Chọn sản phẩm từ kho
                  </label>
                </div>

                {formData.linkType === 'url' ? (
                  <input className="form-input" value={formData.linkRedirect}
                    placeholder="VD: /products?category=vga hoặc https://example.com"
                    onChange={e => setFormData(p => ({ ...p, linkRedirect: e.target.value }))} />
                ) : (
                  /* Chọn sản phẩm từ DB */
                  <div style={{ position: 'relative' }}>
                    {/* Hiển SP đã chọn */}
                    {formData.selectedProductId && (() => {
                      const sp = products.find(p => p.maSP === formData.selectedProductId);
                      return sp ? (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                          background: '#eff6ff', borderRadius: 10, border: '2px solid #3b82f6',
                          marginBottom: 10
                        }}>
                          {sp.hinhAnh && <img src={sp.hinhAnh} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e40af' }}>{sp.tenSP}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>ID: #{sp.maSP} — {Number(sp.giaBan).toLocaleString('vi-VN')}đ</div>
                          </div>
                          <button type="button" onClick={() => {
                            setFormData(p => ({ ...p, selectedProductId: null, linkRedirect: '' }));
                            setProductSearch('');
                          }} style={{
                            background: '#fee2e2', border: 'none', borderRadius: '50%',
                            width: 28, height: 28, cursor: 'pointer', color: '#dc2626',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'
                          }}>✕</button>
                        </div>
                      ) : null;
                    })()}

                    {/* Ô tìm kiếm */}
                    <input
                      className="form-input"
                      placeholder="Gõ tên sản phẩm để tìm..."
                      value={productSearch}
                      onChange={e => { setProductSearch(e.target.value); setShowProductDropdown(true); }}
                      onFocus={() => setShowProductDropdown(true)}
                    />

                    {/* Dropdown kết quả */}
                    {showProductDropdown && (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.12)', maxHeight: 220, overflowY: 'auto',
                        marginTop: 4
                      }}>
                        {filteredProducts.length === 0 ? (
                          <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                            Không tìm thấy sản phẩm
                          </div>
                        ) : filteredProducts.map(p => (
                          <div key={p.maSP}
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                selectedProductId: p.maSP,
                                linkRedirect: `${window.location.origin}/products/${p.maSP}`
                              }));
                              setProductSearch('');
                              setShowProductDropdown(false);
                            }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '10px 14px', cursor: 'pointer',
                              borderBottom: '1px solid #f1f5f9',
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                          >
                            {p.hinhAnh && <img src={p.hinhAnh} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, fontSize: '0.85rem', color: '#1e293b' }}>{p.tenSP}</div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>#{p.maSP} — {Number(p.giaBan).toLocaleString('vi-VN')}đ</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{
                display: 'flex', gap: '12px', justifyContent: 'flex-end',
                marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '20px'
              }}>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit" className="btn-primary" disabled={formLoading || uploading}>
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

export default AdManagement;
