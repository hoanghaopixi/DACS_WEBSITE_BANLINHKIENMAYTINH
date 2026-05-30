import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import categoryService from '../../services/categoryService';
import productService from '../../services/productService';
import api from '../../services/api';
import '../../styles/pages/CommonAdmin.css';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ tenDanhMuc: '', moTa: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catData, prodData] = await Promise.all([
        categoryService.getAllCategories(),
        productService.getAllProducts()
      ]);
      setCategories(catData);
      setProducts(prodData);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  // Count products per category name
  const productCountMap = useMemo(() => {
    const map = {};
    products.forEach(p => {
      const cat = p.category || 'Khác';
      map[cat] = (map[cat] || 0) + 1;
    });
    return map;
  }, [products]);

  const handleOpenModal = (category = null) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({ tenDanhMuc: category.name, moTa: category.description || '' });
    } else {
      setSelectedCategory(null);
      setFormData({ tenDanhMuc: '', moTa: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCategory) {
        await api.put(`danh-muc/${selectedCategory.id}`, formData);
        alert('Cập nhật thành công!');
      } else {
        await api.post('danh-muc', formData);
        alert('Thêm mới thành công!');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    const category = categories.find(c => c.id === id);
    const count = category ? (productCountMap[category.name] || 0) : 0;
    
    // Pre-check: warn user if category has products
    if (count > 0) {
      alert(`Không thể xóa danh mục "${category.name}" vì vẫn còn ${count} sản phẩm thuộc danh mục này.\n\nVui lòng chuyển hoặc xóa các sản phẩm trước khi xóa danh mục.`);
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await api.delete(`danh-muc/${id}`);
        alert('Đã xóa thành công!');
        fetchData();
      } catch (error) {
        const msg = error.response?.data?.message || error.message;
        alert(msg);
      }
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header-flex">
        <h1 className="admin-title">Quản lý danh mục</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <FaPlus /> Thêm danh mục
        </button>
      </div>

      <div className="admin-page-body">

      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên danh mục</th>
                <th>Mô tả</th>
                <th>Số sản phẩm</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Chưa có danh mục nào.</td></tr>
              ) : categories.map((cat) => (
                <tr key={cat.id}>
                  <td>#{cat.id}</td>
                  <td style={{ fontWeight: 600 }}>{cat.name}</td>
                  <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{cat.description || 'Chưa có mô tả'}</td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      background: (productCountMap[cat.name] || 0) > 0 ? '#dcfce7' : '#f1f5f9',
                      color: (productCountMap[cat.name] || 0) > 0 ? '#10b981' : '#94a3b8',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}>
                      {productCountMap[cat.name] || 0} sản phẩm
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon btn-edit" onClick={() => handleOpenModal(cat)}><FaEdit /></button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(cat.id)}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="admin-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="admin-card" style={{ width: '100%', maxWidth: '500px' }}>
            <h2>{selectedCategory ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
            <form onSubmit={handleSubmit} className="admin-form" style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label className="form-label">Tên danh mục</label>
                <input 
                  type="text" className="form-input" required
                  value={formData.tenDanhMuc} 
                  onChange={(e) => setFormData({...formData, tenDanhMuc: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả</label>
                <textarea 
                  className="form-textarea" 
                  value={formData.moTa} 
                  onChange={(e) => setFormData({...formData, moTa: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
          </div>
</div>
  );
};

export default CategoryManagement;

