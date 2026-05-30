import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaArrowLeft, FaCloudUploadAlt, FaLink, FaTrash } from 'react-icons/fa';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import brandService from '../../services/brandService';
import api from '../../services/api';
import '../../styles/pages/CommonAdmin.css';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    tenSP: '',
    maDanhMuc: '',
    maThuongHieu: '',
    giaNhap: '',
    giaBan: '',
    giaKM: '',
    soLuongTon: '',
    tonToiThieu: 5,
    baoHanh: 12,
    hinhAnh: '',
    moTa: ''
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingChild, setUploadingChild] = useState(false);
  const [useUrl, setUseUrl] = useState(false);
  const [childImages, setChildImages] = useState([]);
  const childFileInputRef = useRef(null);

  useEffect(() => {
    const loadResources = async () => {
      try {
        const [catData, brandData] = await Promise.all([
          categoryService.getAllCategories(),
          brandService.getAllBrands()
        ]);
        setCategories(catData);
        setBrands(brandData);

        if (isEdit) {
          setLoading(true);
          const product = await productService.getProductById(id);
          setFormData({
            tenSP: product.name,
            maDanhMuc: product.maDanhMuc || '',
            maThuongHieu: product.maThuongHieu || '',
            giaNhap: product.priceIn || '',
            giaBan: product.price || '',
            soLuongTon: product.stock,
            tonToiThieu: product.minStock || 5,
            baoHanh: product.warranty,
            hinhAnh: product.image,
            moTa: product.description
          });
          // If image is URL, show URL input mode
          if (product.image && product.image.startsWith('http')) {
            setUseUrl(true);
          }
          if (product.mediaList && product.mediaList.length > 0) {
            setChildImages(product.mediaList.filter(m => m.loai === 'IMAGE' || !m.loai).map(m => m.url));
          }
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh (JPG, PNG, WEBP...)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa 5MB');
      return;
    }

    try {
      setUploading(true);
      const formPayload = new FormData();
      formPayload.append('file', file);

      const response = await api.post('upload/product-image', formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data && response.data.code === 200) {
        setFormData(prev => ({ ...prev, hinhAnh: response.data.data.url }));
        setUseUrl(false);
      } else {
        alert('Lỗi upload: ' + (response.data?.message || 'Không xác định'));
      }
    } catch (error) {
      alert('Lỗi upload ảnh: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleChildFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    if (childImages.length + files.length > 5) {
      alert('Tối đa chỉ được tải lên 5 ảnh phụ.');
      return;
    }

    try {
      setUploadingChild(true);
      const newUrls = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const formPayload = new FormData();
        formPayload.append('file', file);
        const response = await api.post('upload/product-image', formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data && response.data.code === 200) {
          newUrls.push(response.data.data.url);
        }
      }
      setChildImages(prev => [...prev, ...newUrls]);
    } catch (error) {
      alert('Lỗi upload ảnh phụ: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadingChild(false);
    }
  };

  const removeChildImage = (index) => {
    setChildImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...formData,
        danhMuc: { maDanhMuc: formData.maDanhMuc },
        thuongHieu: { maThuongHieu: formData.maThuongHieu },
        hinhAnhSanPhams: childImages.map(url => ({ url, loai: 'IMAGE' }))
      };

      if (isEdit) {
        await productService.updateProduct(id, payload);
        alert('Cập nhật sản phẩm thành công!');
      } else {
        await productService.createProduct(payload);
        alert('Thêm sản phẩm mới thành công!');
      }
      navigate('/admin/products');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getImageSrc = () => {
    if (!formData.hinhAnh) return null;
    // If it starts with /api, it's a local upload
    if (formData.hinhAnh.startsWith('/api')) {
      return formData.hinhAnh;
    }
    return formData.hinhAnh;
  };

  if (loading && isEdit) return <div>Đang tải dữ liệu sản phẩm...</div>;

  return (
    <div className="admin-page">
      <div className="admin-header-flex">
        <h1 className="admin-title">{isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h1>
        <button className="btn-secondary" onClick={() => navigate('/admin/products')}>
          <FaArrowLeft /> Quay lại
        </button>
      </div>

      <div className="admin-page-body">

      <div className="admin-card">
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="form-left">
              <div className="form-group">
                <label className="form-label">Tên sản phẩm</label>
                <input 
                  type="text" name="tenSP" className="form-input" 
                  value={formData.tenSP} onChange={handleChange} required 
                  placeholder="Ví dụ: NVIDIA GeForce RTX 4090"
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Danh mục</label>
                  <select name="maDanhMuc" className="form-select" value={formData.maDanhMuc} onChange={handleChange} required>
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Thương hiệu</label>
                  <select name="maThuongHieu" className="form-select" value={formData.maThuongHieu} onChange={handleChange} required>
                    <option value="">-- Chọn thương hiệu --</option>
                    {brands.map(b => <option key={b.maThuongHieu} value={b.maThuongHieu}>{b.tenThuongHieu}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Giá nhập (VNĐ)</label>
                  <input type="number" name="giaNhap" className="form-input" value={formData.giaNhap} onChange={handleChange} required min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Giá bán (VNĐ)</label>
                  <input type="number" name="giaBan" className="form-input" value={formData.giaBan} onChange={handleChange} required min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Giá KM (VNĐ)</label>
                  <input type="number" name="giaKM" className="form-input" value={formData.giaKM || ''} onChange={handleChange} min="0" placeholder="Để trống nếu không có KM" />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Số lượng tồn</label>
                  <input type="number" name="soLuongTon" className="form-input" value={formData.soLuongTon} onChange={handleChange} required min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Tồn tối thiểu</label>
                  <input type="number" name="tonToiThieu" className="form-input" value={formData.tonToiThieu} onChange={handleChange} min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Bảo hành (tháng)</label>
                  <input type="number" name="baoHanh" className="form-input" value={formData.baoHanh} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="form-right">
              <div className="form-group">
                <label className="form-label">Hình ảnh sản phẩm</label>
                
                {/* Upload / URL toggle */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button 
                    type="button" 
                    onClick={() => setUseUrl(false)}
                    style={{
                      padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0',
                      background: !useUrl ? '#6366f1' : '#f1f5f9',
                      color: !useUrl ? '#fff' : '#64748b',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                      fontSize: '0.85rem', fontWeight: 600
                    }}
                  >
                    <FaCloudUploadAlt /> Upload từ máy
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setUseUrl(true)}
                    style={{
                      padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0',
                      background: useUrl ? '#6366f1' : '#f1f5f9',
                      color: useUrl ? '#fff' : '#64748b',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                      fontSize: '0.85rem', fontWeight: 600
                    }}
                  >
                    <FaLink /> Nhập URL
                  </button>
                </div>

                {useUrl ? (
                  <input 
                    type="text" name="hinhAnh" className="form-input" 
                    value={formData.hinhAnh} onChange={handleChange} 
                    placeholder="https://example.com/image.jpg"
                  />
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '32px 16px',
                      textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                      background: uploading ? '#f8fafc' : '#fff'
                    }}
                    onMouseOver={e => e.currentTarget.style.borderColor = '#6366f1'}
                    onMouseOut={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                  >
                    <input 
                      ref={fileInputRef} type="file" accept="image/*"
                      onChange={handleFileUpload} style={{ display: 'none' }}
                    />
                    <FaCloudUploadAlt size={32} color={uploading ? '#94a3b8' : '#6366f1'} />
                    <p style={{ margin: '8px 0 4px', fontWeight: 600, color: '#334155' }}>
                      {uploading ? 'Đang upload...' : 'Nhấp để chọn ảnh'}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                      JPG, PNG, WEBP • Tối đa 5MB
                    </p>
                  </div>
                )}

                {/* Preview */}
                {getImageSrc() && (
                  <div style={{ 
                    marginTop: '16px', border: '1px solid #e2e8f0', padding: '12px', 
                    borderRadius: '12px', textAlign: 'center', position: 'relative',
                    background: '#fafafa'
                  }}>
                    <img src={getImageSrc()} alt="Preview" style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '8px' }} />
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, hinhAnh: '' }))}
                      style={{
                        position: 'absolute', top: '8px', right: '8px',
                        background: '#ef4444', color: '#fff', border: 'none',
                        borderRadius: '50%', width: '28px', height: '28px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Child Images Section */}
              <div className="form-group" style={{ marginTop: '24px' }}>
                <label className="form-label">Ảnh phụ sản phẩm (Tối đa 5 ảnh)</label>
                <div 
                  onClick={() => childFileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '16px',
                    textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                    background: uploadingChild ? '#f8fafc' : '#fff', marginBottom: '12px'
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = '#6366f1'}
                  onMouseOut={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                >
                  <input 
                    ref={childFileInputRef} type="file" accept="image/*" multiple
                    onChange={handleChildFileUpload} style={{ display: 'none' }}
                  />
                  <FaCloudUploadAlt size={24} color={uploadingChild ? '#94a3b8' : '#6366f1'} />
                  <p style={{ margin: '8px 0 0', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                    {uploadingChild ? 'Đang upload...' : 'Nhấp để chọn thêm ảnh phụ'}
                  </p>
                </div>

                {childImages.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {childImages.map((url, idx) => (
                      <div key={idx} style={{ 
                        position: 'relative', border: '1px solid #e2e8f0', padding: '4px', 
                        borderRadius: '8px', background: '#fafafa'
                      }}>
                        <img src={url} alt={`child-${idx}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                        <button 
                          type="button" 
                          onClick={() => removeChildImage(idx)}
                          style={{
                            position: 'absolute', top: '-4px', right: '-4px',
                            background: '#ef4444', color: '#fff', border: 'none',
                            borderRadius: '50%', width: '20px', height: '20px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '10px'
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginTop: '24px' }}>
                <label className="form-label">Mô tả sản phẩm</label>
                <textarea 
                  name="moTa" className="form-textarea" 
                  value={formData.moTa} onChange={handleChange}
                  placeholder="Nhập mô tả chi tiết sản phẩm..."
                  style={{ height: '160px' }}
                />
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '32px', borderTop: '1px solid #e2e8f0', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary" disabled={loading || uploading} style={{ padding: '12px 32px' }}>
              <FaSave /> {loading ? 'Đang xử lý...' : (isEdit ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm')}
            </button>
          </div>
        </form>
      </div>
          </div>
</div>
  );
};

export default ProductForm;
