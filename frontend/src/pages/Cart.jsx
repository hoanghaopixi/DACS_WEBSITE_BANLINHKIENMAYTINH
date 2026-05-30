import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart, FaArrowRight } from 'react-icons/fa';
import { useCartSession } from '../context/CartSession';
import '../styles/pages/Cart.css';

function Cart() {
  const navigate = useNavigate();
  const { cart, isCartLoading, updateCartItem, removeCartItem, clearCart } = useCartSession();
  const cartItems = cart.items || [];

  const updateQuantity = async (id, nextQuantity) => {
    try {
      await updateCartItem(id, Math.max(1, nextQuantity));
    } catch (error) {
      console.error('Không thể cập nhật số lượng:', error);
    }
  };

  const removeItem = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) return;
    try {
      await removeCartItem(id);
    } catch (error) {
      console.error('Không thể xóa sản phẩm:', error);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) return;
    try {
      await clearCart();
    } catch (error) {
      console.error('Không thể xóa giỏ hàng:', error);
    }
  };

  const totalAmount = Number(cart.totalAmount || 0);

  if (isCartLoading) {
    return (
      <div className="cart-empty">
        <div className="container">
          <FaShoppingCart className="empty-icon" />
          <h1>Đang tải giỏ hàng...</h1>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <div className="container">
          <FaShoppingCart className="empty-icon" />
          <h1>Giỏ hàng của bạn đang trống</h1>
          <p>Hãy bắt đầu mua sắm ngay hôm nay!</p>
          <Link to="/products" className="btn-shop-now">
            Tiếp tục mua sắm <FaArrowRight />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-heading">
          <h1>Giỏ hàng</h1>
          <p className="cart-subtitle">{cart.totalQuantity} sản phẩm trong giỏ hàng của bạn.</p>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.productId} className="cart-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-category">{item.category}</p>
                  <p className="item-price">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                  </p>
                </div>
                <div className="item-quantity">
                  <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)}><FaMinus /></button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)}><FaPlus /></button>
                </div>
                <div className="item-subtotal">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal)}
                </div>
                <button className="btn-remove" type="button" onClick={() => removeItem(item.productId)}>
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Tóm tắt đơn hàng</h3>
            <div className="summary-row">
              <span>Số món hàng:</span>
              <span>{cart.totalQuantity}</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span className="free-shipping">Chưa tính</span>
            </div>
            <div className="summary-row total">
              <span>Tổng cộng:</span>
              <span className="total-price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cart.totalAmount)}</span>
            </div>
            <button className="btn-checkout" onClick={() => navigate('/checkout')}>
              Tiến hành thanh toán
            </button>
            <button 
              className="btn-continue-shopping" 
              onClick={() => navigate('/')}
            >
              Tiếp tục mua sắm
            </button>
            <button type="button" className="btn-clear-cart" onClick={handleClearCart}>
              <FaTrash /> Xóa toàn bộ giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
