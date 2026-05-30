import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaGlobeAmericas, FaExternalLinkAlt, FaEye, FaTimes, FaTrademark } from 'react-icons/fa';
import brandService from '../../services/brandService';
import productService from '../../services/productService';
import '../../styles/pages/CommonAdmin.css';

const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [formData, setFormData] = useState({
    tenThuongHieu: '',
    quocGia: '',
    website: '',
    logo: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [brandData, prodData] = await Promise.all([
        brandService.getAllBrands(),
        productService.getAllProducts()
      ]);
      setBrands(brandData);
      setProducts(prodData);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  // Count products per brand
  const productCountMap = useMemo(() => {
    const map = {};
    products.forEach(p => {
      const brandName = p.brand || p.thuongHieu || '';
      if (brandName) {
        map[brandName] = (map[brandName] || 0) + 1;
      }
    });
    return map;
  }, [products]);

  // Filter brands by search
  const filteredBrands = useMemo(() => {
    if (!searchTerm.trim()) return brands;
    const term = searchTerm.toLowerCase();
    return brands.filter(b =>
      b.tenThuongHieu?.toLowerCase().includes(term) ||
      b.quocGia?.toLowerCase().includes(term)
    );
  }, [brands, searchTerm]);

  // Open add/edit modal
  const handleOpenModal = (brand = null) => {
    if (brand) {
      setSelectedBrand(brand);
      setFormData({
        tenThuongHieu: brand.tenThuongHieu || '',
        quocGia: brand.quocGia || '',
        website: brand.website || '',
        logo: brand.logo || ''
      });
    } else {
      setSelectedBrand(null);
      setFormData({ tenThuongHieu: '', quocGia: '', website: '', logo: '' });
    }
    setShowModal(true);
  };

  // Open detail modal
  const handleViewDetail = (brand) => {
    setSelectedBrand(brand);
    setShowDetailModal(true);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tenThuongHieu.trim()) {
      alert('Vui lòng nhập tên thương hiệu!');
      return;
    }
    try {
      setSubmitting(true);
      if (selectedBrand) {
        await brandService.updateBrand(selectedBrand.maThuongHieu, formData);
        alert('Cập nhật thương hiệu thành công!');
      } else {
        await brandService.createBrand(formData);
        alert('Thêm thương hiệu mới thành công!');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async (brand) => {
    const count = productCountMap[brand.tenThuongHieu] || 0;
    const msg = count > 0
      ? `Thương hiệu "${brand.tenThuongHieu}" đang có ${count} sản phẩm liên kết. Bạn có chắc muốn xóa?`
      : `Bạn có chắc chắn muốn xóa thương hiệu "${brand.tenThuongHieu}"?`;

    if (window.confirm(msg)) {
      try {
        await brandService.deleteBrand(brand.maThuongHieu);
        alert('Đã xóa thành công!');
        fetchData();
      } catch (error) {
        alert('Lỗi khi xóa: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header-flex">
        <h1 className="admin-title">Quản lý thương hiệu</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <FaPlus /> Thêm thương hiệu
        </button>
      </div>

      <div className="admin-page-body">

      <div className="admin-card">
        {/* Search */}
        <div className="search-box-wrapper" style={{ marginBottom: '16px' }}>
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm theo tên, quốc gia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {filteredBrands.length} / {brands.length} thương hiệu
          </span>
        </div>

        {/* Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Logo</th>
                <th>Tên thương hiệu</th>
                <th>Quốc gia</th>
                <th>Website</th>
                <th>Số sản phẩm</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</td></tr>
              ) : filteredBrands.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                  {searchTerm ? 'Không tìm thấy thương hiệu phù hợp.' : 'Chưa có thương hiệu nào.'}
                </td></tr>
              ) : filteredBrands.map((brand) => (
                <tr key={brand.maThuongHieu}>
                  <td>#{brand.maThuongHieu}</td>
                  <td>
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.tenThuongHieu}
                        style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: '8px', background: 'var(--bg-card-hover, #f1f5f9)', padding: '4px' }}
                      />
                    ) : (
                      <div style={{
                        width: 40, height: 40, borderRadius: '8px',
                        background: 'var(--bg-card-hover, #f1f5f9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-muted)', fontSize: '1rem'
                      }}>
                        <FaTrademark />
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{brand.tenThuongHieu}</td>
                  <td>
                    {brand.quocGia ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaGlobeAmericas style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }} />
                        {brand.quocGia}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                    )}
                  </td>
                  <td>
                    {brand.website ? (
                      <a
                        href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                      >
                        <FaExternalLinkAlt style={{ fontSize: '0.7rem' }} />
                        {brand.website.replace(/^https?:\/\//, '').replace(/\/$/, '').substring(0, 30)}
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                    )}
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      background: (productCountMap[brand.tenThuongHieu] || 0) > 0 ? '#dcfce7' : 'var(--border-light, #f1f5f9)',
                      color: (productCountMap[brand.tenThuongHieu] || 0) > 0 ? '#10b981' : 'var(--text-muted, #94a3b8)',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}>
                      {productCountMap[brand.tenThuongHieu] || 0} sản phẩm
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon" title="Xem chi tiết" onClick={() => handleViewDetail(brand)}>
                        <FaEye />
                      </button>
                      <button className="btn-icon btn-edit" title="Sửa" onClick={() => handleOpenModal(brand)}>
                        <FaEdit />
                      </button>
                      <button className="btn-icon btn-delete" title="Xóa" onClick={() => handleDelete(brand)}>
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

      {/* ===== ADD/EDIT MODAL ===== */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000
        }} onClick={() => setShowModal(false)}>
          <div className="admin-card" style={{ width: '100%', maxWidth: '550px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>
                {selectedBrand ? 'Sửa thương hiệu' : 'Thêm thương hiệu mới'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }}
              ><FaTimes /></button>
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label className="form-label">Tên thương hiệu *</label>
                <input
                  type="text" className="form-input" required
                  placeholder="Ví dụ: Intel, ASUS, Corsair..."
                  value={formData.tenThuongHieu}
                  onChange={(e) => setFormData({ ...formData, tenThuongHieu: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Quốc gia</label>
                <input
                  type="text" className="form-input"
                  placeholder="Ví dụ: Mỹ, Đài Loan, Nhật Bản..."
                  value={formData.quocGia}
                  onChange={(e) => setFormData({ ...formData, quocGia: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Website</label>
                <input
                  type="text" className="form-input"
                  placeholder="Ví dụ: https://www.intel.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Logo URL</label>
                <input
                  type="text" className="form-input"
                  placeholder="URL hình ảnh logo thương hiệu"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                />
                {formData.logo && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={formData.logo}
                      alt="Logo preview"
                      style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border-color)', padding: '4px' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Xem trước logo</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== DETAIL MODAL ===== */}
      {showDetailModal && selectedBrand && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000
        }} onClick={() => setShowDetailModal(false)}>
          <div className="admin-card" style={{ width: '100%', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Chi tiết thương hiệu</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }}
              ><FaTimes /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Logo */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {selectedBrand.logo ? (
                  <img
                    src={selectedBrand.logo}
                    alt={selectedBrand.tenThuongHieu}
                    style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '8px', background: 'var(--bg-card-hover, #f8fafc)' }}
                  />
                ) : (
                  <div style={{
                    width: 80, height: 80, borderRadius: '12px',
                    background: 'var(--bg-card-hover, #f1f5f9)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)', fontSize: '2rem'
                  }}>
                    <FaTrademark />
                  </div>
                )}
              </div>

              {/* Info rows */}
              {[
                { label: 'Mã thương hiệu', value: `#${selectedBrand.maThuongHieu}` },
                { label: 'Tên thương hiệu', value: selectedBrand.tenThuongHieu, bold: true },
                { label: 'Quốc gia', value: selectedBrand.quocGia || 'Chưa cập nhật' },
                { label: 'Website', value: selectedBrand.website, isLink: true },
                { label: 'Số sản phẩm', value: `${productCountMap[selectedBrand.tenThuongHieu] || 0} sản phẩm` },
              ].map((row, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border-light, #f1f5f9)'
                }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{row.label}</span>
                  {row.isLink && row.value ? (
                    <a
                      href={row.value.startsWith('http') ? row.value : `https://${row.value}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {row.value.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      <FaExternalLinkAlt style={{ fontSize: '0.7rem' }} />
                    </a>
                  ) : (
                    <span style={{ fontWeight: row.bold ? 700 : 500, color: 'var(--text-primary)' }}>
                      {row.value || 'Chưa cập nhật'}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>Đóng</button>
              <button className="btn-primary" onClick={() => { setShowDetailModal(false); handleOpenModal(selectedBrand); }}>
                <FaEdit /> Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
          </div>
</div>
  );
};

export default BrandManagement;
