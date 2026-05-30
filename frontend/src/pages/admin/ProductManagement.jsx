import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaTimes, FaStar } from 'react-icons/fa';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import api from '../../services/api';
import '../../styles/pages/CommonAdmin.css';

const ProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProductReviews, setSelectedProductReviews] = useState([]);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Lỗi khi tải sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) {
      fetchProducts();
      return;
    }
    try {
      setLoading(true);
      const data = await productService.searchProducts(searchTerm);
      setProducts(data);
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await productService.deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        alert('Lỗi khi xóa sản phẩm: ' + error.message);
      }
    }
  };

  const openReviews = async (product) => {
    setSelectedProductForReview(product);
    setReviewModalOpen(true);
    try {
      setReviewLoading(true);
      const res = await api.get(`/danh-gia/san-pham/${product.id}`);
      if (res.data && res.data.code === 200) {
        setSelectedProductReviews(res.data.data);
      }
    } catch (e) {
      console.error('Lỗi lấy đánh giá', e);
      setSelectedProductReviews([]);
    } finally {
      setReviewLoading(false);
    }
  };

  const deleteReview = async (id) => {
    if (window.confirm("Bạn muốn xóa đánh giá này?")) {
      try {
         await api.delete(`/danh-gia/${id}`);
         setSelectedProductReviews(selectedProductReviews.filter(r => r.maDanhGia !== id));
      } catch (e) {
         alert("Lỗi khi xóa: " + e.message);
      }
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const isFiltering = categoryFilter !== '';

  const filteredProducts = useMemo(() => {
    if (!categoryFilter) return products;
    return products.filter(p => p.category === categoryFilter);
  }, [products, categoryFilter]);

  const showCategoryCol = !isFiltering;
  const totalCols = showCategoryCol ? 9 : 8;

  return (
    <div className="admin-page">
      <div className="admin-header-flex">
        <h1 className="admin-title">Quản lý sản phẩm</h1>
        <button className="btn-primary" onClick={() => navigate('/admin/products/add')}>
          <FaPlus /> Thêm sản phẩm
        </button>
      </div>

      <div className="admin-page-body">

      <div className="admin-card">
        <div className="table-actions" style={{ marginBottom: '24px' }}>
          <form onSubmit={handleSearch} className="search-box-wrapper">
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Tìm tên sản phẩm..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary">Tìm</button>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '180px', padding: '10px 14px', borderRadius: '12px' }}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            {isFiltering && (
              <button 
                type="button" 
                className="btn-icon" 
                title="Bỏ lọc"
                onClick={() => setCategoryFilter('')}
                style={{ color: '#ef4444' }}
              >
                <FaTimes />
              </button>
            )}
          </form>
        </div>

        {isFiltering && (
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#e0e7ff', color: '#4338ca', padding: '6px 14px', 
            borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '16px'
          }}>
            Đang lọc: {categoryFilter}
            <button 
              onClick={() => setCategoryFilter('')}
              style={{ background: 'none', border: 'none', color: '#4338ca', cursor: 'pointer', padding: '0 0 0 4px', fontSize: '1rem', lineHeight: 1 }}
            >×</button>
          </div>
        )}

        <div className="admin-table-container">
          <table className="admin-table" style={{ tableLayout: 'auto', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '70px' }}>Mã SP</th>
                <th style={{ width: '80px' }}>Hình ảnh</th>
                <th>Tên sản phẩm</th>
                {showCategoryCol && <th style={{ width: '130px' }}>Danh mục</th>}
                <th style={{ width: '130px' }}>Giá bán</th>
                <th style={{ width: '80px' }}>Tồn kho</th>
                <th style={{ width: '80px' }}>Đánh giá</th>
                <th style={{ width: '120px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={totalCols} style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={totalCols} style={{ textAlign: 'center', padding: '40px' }}>
                  {categoryFilter ? `Không có sản phẩm nào trong danh mục "${categoryFilter}".` : 'Không có sản phẩm nào.'}
                </td></tr>
              ) : filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>#{product.id}</td>
                  <td>
                    <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                  </td>
                  <td style={{ fontWeight: 600 }}>{product.name}</td>
                  {showCategoryCol && (
                    <td>
                      <span style={{ 
                        display: 'inline-block', background: '#f1f5f9', color: '#475569',
                        padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700,
                        whiteSpace: 'nowrap'
                      }}>
                        {product.category || 'Khác'}
                      </span>
                    </td>
                  )}
                  <td style={{ color: '#6366f1', fontWeight: 700 }}>{formatCurrency(product.price)}</td>
                  <td>
                    <span style={{ 
                      color: product.stock <= (product.minStock || 0) ? '#ef4444' : '#10b981', 
                      fontWeight: 700,
                      background: product.stock <= (product.minStock || 0) ? '#fee2e2' : '#dcfce7',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                     <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => openReviews(product)}>
                        Xem ({product.reviewCount || 0})
                     </button>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon btn-edit" title="Sửa" onClick={() => navigate(`/admin/products/edit/${product.id}`)}><FaEdit /></button>
                      <button className="btn-icon btn-delete" title="Xóa" onClick={() => handleDelete(product.id)}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {reviewModalOpen && (
         <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Đánh giá: {selectedProductForReview?.name}</h2>
                  <button onClick={() => setReviewModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
               </div>
               
               {reviewLoading ? (
                  <p>Đang tải đánh giá...</p>
               ) : selectedProductReviews.length === 0 ? (
                  <p>Chưa có đánh giá nào cho sản phẩm này.</p>
               ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                     {selectedProductReviews.map(r => (
                        <div key={r.maDanhGia} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <strong style={{ fontSize: '0.95rem' }}>{r.khachHang?.hoTen || 'Khách hàng'}</strong>
                              <button onClick={() => deleteReview(r.maDanhGia)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px', fontSize: '0.75rem' }}>
                                 Xóa
                              </button>
                           </div>
                           <div style={{ color: '#ffc107', margin: '4px 0' }}>
                              {[...Array(5)].map((_, i) => <FaStar key={i} color={i < r.diemSao ? '#ffc107' : '#e2e8f0'} />)}
                           </div>
                           <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#334155' }}>{r.noiDung}</p>
                           {r.hinhAnhDanhGias && r.hinhAnhDanhGias.length > 0 && (
                              <div style={{ display: 'flex', gap: '8px', margin: '8px 0', flexWrap: 'wrap' }}>
                                 {r.hinhAnhDanhGias.map((m, idx) => (
                                    m.loai === 'VIDEO' ? (
                                       <video key={idx} src={m.url} controls style={{ width: '150px', height: '100px', borderRadius: '4px', background: '#000' }} />
                                    ) : (
                                       <img key={idx} src={m.url} alt="review" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                                    )
                                 ))}
                              </div>
                           )}
                           <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                              {new Date(r.ngayDanhGia).toLocaleString('vi-VN')}
                              {r.daChinhSua && <span> (đã chỉnh sửa)</span>}
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>
      )}
          </div>
</div>
  );
};

export default ProductManagement;
