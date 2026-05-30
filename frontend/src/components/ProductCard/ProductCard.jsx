import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';
import { FaShoppingCart, FaStar } from 'react-icons/fa'; // Icon giỏ hàng và sao
import { useCartSession } from '../../context/CartSession';

const ProductCard = ({ product }) => {
  const { addToCart } = useCartSession();
  // Hàm định dạng tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, 1, { name: product.name, image: product.image });
    } catch (error) {
      console.error('Không thể thêm vào giỏ hàng:', error);
      alert(error.message || 'Không thể thêm vào giỏ hàng.');
    }
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-image">
        <img src={product.image} alt={product.name} />
      </Link>
      <div className="product-info">
        <Link to={`/products/${product.id}`} className="product-name">
          {product.name}
        </Link>
        <div className="product-price-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '8px' }}>
          {product.hasDiscount ? (
            <>
              <div className="card-original-price" style={{ textDecoration: 'line-through', color: '#999', fontSize: '14px', marginLeft: '0', marginBottom: '2px', fontWeight: 'normal' }}>
                {formatCurrency(product.originalPrice)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="product-price" style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>{formatCurrency(product.price)}</span>
                <span className="card-discount-badge" style={{ position: 'static', padding: '1px 4px', fontSize: '12px', border: '1px solid #dc3545', color: '#dc3545', borderRadius: '4px', backgroundColor: '#fff', fontWeight: 'bold' }}>-{product.discountPercent}%</span>
              </div>
            </>
          ) : (
            <div className="product-price" style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>{formatCurrency(product.price)}</div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div className="product-rating" style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            <strong style={{ color: '#ffc107', fontSize: '0.95rem' }}>
              {product.averageRating ? product.averageRating.toFixed(1) : '0.0'} <FaStar />
            </strong> 
            <br />
            <span>({product.reviewCount || 0} đánh giá)</span>
          </div>
          {product.soldQuantity > 0 && (
              <div style={{ background: 'linear-gradient(90deg, #ff0000, #fd0000ff)', color: 'white', fontSize: '11px', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold', display: 'inline-block', whiteSpace: 'nowrap' }}>
                  Đã bán: {product.soldQuantity}
              </div>
          )}
        </div>
        <button className="add-to-cart-btn" type="button" onClick={handleAddToCart}>
          <FaShoppingCart /> Thêm vào giỏ
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
