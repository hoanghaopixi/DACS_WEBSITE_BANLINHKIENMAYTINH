import React, { useState, useEffect, useMemo } from 'react';
import { FaTimes, FaSearch, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import productService from '../../services/productService';
import orderService from '../../services/orderService';
import '../../styles/pages/CommonAdmin.css'; // Reuse existing styles

const OrderCreateModal = ({ onClose, onSuccess }) => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [customerType, setCustomerType] = useState('vanglai'); // 'vanglai' | 'thongtin'
  const [customerInfo, setCustomerInfo] = useState({ tenNguoiNhan: '', sdtNguoiNhan: '', diaChiChiTiet: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Lỗi lấy sản phẩm:', error);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(p => 
      String(p.id).includes(term) || (p.name || '').toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Limit to stock
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        if (newQ > 0 && newQ <= item.stock) return { ...item, quantity: newQ };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCreateOrder = async () => {
    if (cart.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm.');
      return;
    }
    
    if (customerType === 'thongtin') {
      if (!customerInfo.tenNguoiNhan || !customerInfo.sdtNguoiNhan || !customerInfo.diaChiChiTiet) {
        alert('Vui lòng điền đủ thông tin khách hàng (Tên, SĐT, Địa chỉ).');
        return;
      }
    }

    try {
      setLoading(true);
      const payload = {
        tenNguoiNhan: customerType === 'vanglai' ? 'Khách vãng lai' : customerInfo.tenNguoiNhan,
        sdtNguoiNhan: customerType === 'vanglai' ? '0000000000' : customerInfo.sdtNguoiNhan,
        diaChiChiTiet: customerType === 'vanglai' ? 'Tại cửa hàng' : customerInfo.diaChiChiTiet,
        khachHangId: null, // Sẽ tạo/dùng khách vãng lai ở backend
        phiVanChuyen: 0,
        ghiChu: 'Đơn hàng tạo từ POS (Admin)',
        hinhThucThanhToan: 'Tiền mặt',
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      await orderService.createManualOrder(payload);
      alert('Tạo đơn hàng thành công!');
      onSuccess();
    } catch (error) {
      alert('Lỗi tạo đơn hàng: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: '20px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '1000px',
        height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Tạo đơn hàng mới</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}><FaTimes /></button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left: Product Selection */}
          <div style={{ width: '60%', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px' }}>
              <div className="search-input-container" style={{ width: '100%' }}>
                <FaSearch className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Tìm sản phẩm theo Mã hoặc Tên..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {filteredProducts.map(p => (
                  <div key={p.id} onClick={() => addToCart(p)} style={{
                    border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', gap: '8px', transition: 'all 0.2s', background: p.stock > 0 ? '#fff' : '#f8fafc'
                  }} onMouseOver={e => e.currentTarget.style.borderColor = '#6366f1'} onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                    <img src={p.image} alt={p.name} style={{ width: '100%', height: '120px', objectFit: 'contain' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ color: '#6366f1', fontWeight: 700 }}>{formatCurrency(p.price)}</div>
                    <div style={{ fontSize: '0.8rem', color: p.stock > 0 ? '#10b981' : '#ef4444' }}>
                      {p.stock > 0 ? `Tồn kho: ${p.stock}` : 'Hết hàng'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Cart & Customer Info */}
          <div style={{ width: '40%', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
            {/* Customer Info */}
            <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem' }}>Thông tin khách hàng</h3>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="radio" name="customerType" value="vanglai" checked={customerType === 'vanglai'} onChange={() => setCustomerType('vanglai')} />
                  Khách vãng lai
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="radio" name="customerType" value="thongtin" checked={customerType === 'thongtin'} onChange={() => setCustomerType('thongtin')} />
                  Nhập thông tin
                </label>
              </div>

              {customerType === 'thongtin' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input type="text" placeholder="Tên khách hàng (*)" className="form-input" 
                         value={customerInfo.tenNguoiNhan} onChange={e => setCustomerInfo({...customerInfo, tenNguoiNhan: e.target.value})} />
                  <input type="text" placeholder="Số điện thoại (*)" className="form-input" 
                         value={customerInfo.sdtNguoiNhan} onChange={e => setCustomerInfo({...customerInfo, sdtNguoiNhan: e.target.value})} />
                  <input type="text" placeholder="Địa chỉ chi tiết (*)" className="form-input" 
                         value={customerInfo.diaChiChiTiet} onChange={e => setCustomerInfo({...customerInfo, diaChiChiTiet: e.target.value})} />
                </div>
              )}
            </div>

            {/* Cart Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem' }}>Giỏ hàng ({cart.length})</h3>
              {cart.map(item => (
                <div key={item.id} style={{
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px',
                  marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                    <div style={{ color: '#6366f1', fontSize: '0.85rem' }}>{formatCurrency(item.price)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => updateQuantity(item.id, -1)} style={{ padding: '4px', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><FaMinus size={10}/></button>
                    <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} style={{ padding: '4px', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><FaPlus size={10}/></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                    <FaTrash />
                  </button>
                </div>
              ))}
              {cart.length === 0 && <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '20px' }}>Chưa có sản phẩm nào</div>}
            </div>

            {/* Total & Submit */}
            <div style={{ padding: '20px', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '1.2rem', fontWeight: 800 }}>
                <span>Tổng tiền:</span>
                <span style={{ color: '#6366f1' }}>{formatCurrency(totalAmount)}</span>
              </div>
              <button 
                onClick={handleCreateOrder} 
                disabled={loading || cart.length === 0}
                style={{
                  width: '100%', padding: '14px', background: '#6366f1', color: '#fff', border: 'none',
                  borderRadius: '8px', fontWeight: 700, fontSize: '1rem', cursor: (loading || cart.length === 0) ? 'not-allowed' : 'pointer',
                  opacity: (loading || cart.length === 0) ? 0.7 : 1
                }}
              >
                {loading ? 'Đang tạo...' : 'Lưu đơn hàng'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCreateModal;
