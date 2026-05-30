import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartSession } from '../context/CartSession';
import authService from '../services/authService';
import api from '../services/api';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import '../styles/pages/Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCartSession();
  const [authUser, setAuthUser] = useState(null);

  // Form states
  const [hoTen, setHoTen] = useState('');
  const [sdt, setSdt] = useState('');
  const [diaChiChiTiet, setDiaChiChiTiet] = useState('');
  const [ghiChu, setGhiChu] = useState('');

  // Shipping
  const [shippingMethod, setShippingMethod] = useState('delivery'); // 'delivery' or 'pickup'
  const [phiVanChuyen, setPhiVanChuyen] = useState(50000);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('Tiền mặt');

  // Coupon
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { maKM, tenKM, phanTramGiam }
  const [couponMsg, setCouponMsg] = useState(''); // '' | 'success' | 'error'
  const [couponMsgText, setCouponMsgText] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const discountAmount = appliedCoupon
    ? Math.round(cart.totalAmount * appliedCoupon.phanTramGiam / 100)
    : 0;

  // Location data
  const [tinhList, setTinhList] = useState([]);
  const [huyenList, setHuyenList] = useState([]);
  const [xaList, setXaList] = useState([]);

  const [selectedTinh, setSelectedTinh] = useState('');
  const [selectedHuyen, setSelectedHuyen] = useState('');
  const [selectedXa, setSelectedXa] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [vnpayResult, setVnpayResult] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const pendingOrderRef = useRef(null);
  const vnpayPopupRef = useRef(null);

  // Listen for VNPay popup result
  const handleVnpayMessage = useCallback((event) => {
    if (event.data && event.data.type === 'VNPAY_RESULT') {
      setVnpayResult(event.data);
      pendingOrderRef.current = null;
      // Clear cart on success
      if (event.data.status === 'success') {
        clearCart();
      }
    }
  }, [clearCart]);

  useEffect(() => {
    window.addEventListener('message', handleVnpayMessage);
    return () => window.removeEventListener('message', handleVnpayMessage);
  }, [handleVnpayMessage]);

  const handleCancelOrder = async () => {
    const maDonHang = pendingOrderRef.current;
    if (maDonHang) {
      try {
        await api.put(`don-hang/${maDonHang}/status`, null, { params: { status: 'Đã hủy' } });
      } catch (e) {
        console.error('Lỗi hủy đơn hàng:', e);
      }
    }
    pendingOrderRef.current = null;
    setShowCancelConfirm(false);
    await clearCart();
    navigate('/account');
  };

  useEffect(() => {
    const user = authService.getStoredUser();
    if (!user) {
      alert('Vui lòng đăng nhập để tiến hành thanh toán');
      navigate('/login');
    } else {
      setAuthUser(user);
      setHoTen(user.fullName || user.username || '');
      setSdt(user.phone || '');
    }

    if (cart.items.length === 0 && user && !pendingOrderRef.current && !vnpayResult && !showCancelConfirm) {
      navigate('/cart');
    }
  }, [navigate, cart.items.length, vnpayResult, showCancelConfirm]);

  useEffect(() => {
    // Load config location
    const loadTinh = async () => {
      try {
        const res = await api.get('location/tinh');
        setTinhList(res.data.data || []);
      } catch (err) {
        console.error('Lỗi tải Tỉnh:', err);
      }
    };
    loadTinh();
  }, []);

  useEffect(() => {
    const loadHuyen = async () => {
      if (!selectedTinh) return;
      try {
        const res = await api.get(`location/huyen/${selectedTinh}`);
        setHuyenList(res.data.data || []);
        setSelectedHuyen('');
        setXaList([]);
        setSelectedXa('');
      } catch (err) {
        console.error('Lỗi tải Huyện:', err);
      }
    };
    loadHuyen();
  }, [selectedTinh]);

  useEffect(() => {
    const loadXa = async () => {
      if (!selectedHuyen) return;
      try {
        const res = await api.get(`location/xa/${selectedHuyen}`);
        setXaList(res.data.data || []);
        setSelectedXa('');
      } catch (err) {
        console.error('Lỗi tải Xã:', err);
      }
    };
    loadXa();
  }, [selectedHuyen]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponMsg('');
    setCouponMsgText('');
    setCouponLoading(true);
    try {
      const res = await api.get(`khuyen-mai/${couponInput.trim()}/validate`, {
        params: { maKH: authUser.maKH }
      });
      if (res.data?.code === 200 && res.data?.data?.valid) {
        setAppliedCoupon(res.data.data);
        setCouponMsg('success');
        setCouponMsgText(`Áp dụng thành công! Giảm ${res.data.data.phanTramGiam}% - ${res.data.data.tenKM}`);
      } else {
        setAppliedCoupon(null);
        setCouponMsg('error');
        setCouponMsgText(res.data?.message || res.data?.data?.message || 'Mã không hợp lệ.');
      }
    } catch (e) {
      setAppliedCoupon(null);
      setCouponMsg('error');
      setCouponMsgText(e.response?.data?.message || 'Lỗi kiểm tra mã.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponMsg('');
    setCouponMsgText('');
  };

  const handleShippingChange = (e) => {
    const val = e.target.value;
    setShippingMethod(val);
    if (val === 'pickup') {
      setPhiVanChuyen(0);
    } else {
      setPhiVanChuyen(50000);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (shippingMethod === 'delivery') {
      if (!selectedXa || !diaChiChiTiet) {
        setErrorMessage('Vui lòng nhập đầy đủ địa chỉ giao hàng trải dài Từ Tỉnh/Thành phố đến Tên Đường, Số nhà.');
        return;
      }
    }

    if (!hoTen || !sdt) {
      setErrorMessage('Vui lòng nhập đầy đủ thông tin người nhận.');
      return;
    }

    setLoading(true);
    try {
      const itemsPayload = cart.items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.price
      }));

      const payload = {
        khachHangId: authUser.maKH,
        maXa: shippingMethod === 'delivery' ? selectedXa : 1,
        diaChiChiTiet: shippingMethod === 'delivery' ? diaChiChiTiet : 'Nhận tại cửa hàng',
        tenNguoiNhan: hoTen,
        sdtNguoiNhan: sdt,
        phiVanChuyen: phiVanChuyen,
        tongTien: cart.totalAmount - discountAmount + phiVanChuyen,
        maKM: appliedCoupon ? appliedCoupon.maKM : null,
        soTienGiam: discountAmount,
        ghiChu: ghiChu,
        hinhThucThanhToan: paymentMethod,
        items: itemsPayload
      };

      const res = await api.post('don-hang/checkout', payload);
      if (res.data.code === 200 || res.data.code === 201) {

        if (paymentMethod === 'VNPay') {
          const maDonHang = res.data.data.maDonHang;
          const tongTien = payload.tongTien;
          pendingOrderRef.current = maDonHang;

          try {
            const vnpayRes = await api.get('vnpay/create-payment', {
              params: {
                amount: tongTien,
                orderInfo: 'Thanh toan don hang DH_' + maDonHang,
                txnRef: 'DH_' + maDonHang
              }
            });
            if (vnpayRes.data && vnpayRes.data.url) {
              const w = 1280, h = 700;
              const left = (screen.width - w) / 2;
              const top = (screen.height - h) / 2;
              const popup = window.open(
                vnpayRes.data.url,
                'vnpay_popup',
                `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes`
              );
              vnpayPopupRef.current = popup;
              // Poll for popup close
              const timer = setInterval(() => {
                if (popup && popup.closed) {
                  clearInterval(timer);
                  // If no result received, user closed without completing
                  if (pendingOrderRef.current) {
                    setShowCancelConfirm(true);
                  }
                }
              }, 1000);
              return;
            }
          } catch (vnpErr) {
            console.error('Lỗi khi lấy link VNPay:', vnpErr);
            setVnpayResult({ status: 'fail', orderId: 'DH_' + maDonHang, transactionId: null });
            return;
          }
        } else {
          await clearCart();
          alert('Đặt hàng thành công!');
          navigate('/account');
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  if (!authUser || (cart.items.length === 0 && !pendingOrderRef.current && !vnpayResult && !showCancelConfirm)) return null;

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link> {'>'} <Link to="/cart">Giỏ hàng</Link> {'>'} <span>Thanh toán</span>
        </div>

        <h1 className="checkout-title">Tiến hành thanh toán</h1>

        {errorMessage && <div className="checkout-alert error">{errorMessage}</div>}

        <form onSubmit={handleCheckout} className="checkout-layout">
          {/* Left Column: Info & Delivery */}
          <div className="checkout-left">
            <section className="checkout-section">
              <h2>Thông tin khách mua hàng</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Anh/Chị</label>
                  <input type="text" value={hoTen} onChange={(e) => setHoTen(e.target.value)} required placeholder="Nhập họ tên" />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input type="tel" value={sdt} onChange={(e) => setSdt(e.target.value)} required placeholder="Nhập số điện thoại" />
                </div>
              </div>
            </section>

            <section className="checkout-section">
              <h2>Cách nhận hàng</h2>
              <div className="shipping-methods">
                <label className={`shipping-option ${shippingMethod === 'delivery' ? 'active' : ''}`}>
                  <input type="radio" value="delivery" checked={shippingMethod === 'delivery'} onChange={handleShippingChange} />
                  Giao hàng tận nơi
                </label>
                <label className={`shipping-option ${shippingMethod === 'pickup' ? 'active' : ''}`}>
                  <input type="radio" value="pickup" checked={shippingMethod === 'pickup'} onChange={handleShippingChange} />
                  Nhận tại cửa hàng
                </label>
              </div>

              {shippingMethod === 'delivery' && (
                <div className="delivery-details">
                  <div className="form-row location-row">
                    <div className="form-group">
                      <select value={selectedTinh} onChange={(e) => setSelectedTinh(e.target.value)}>
                        <option value="">Chọn Tỉnh/Thành</option>
                        {tinhList.map(t => <option key={t.maTinh} value={t.maTinh}>{t.tenTinh}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <select value={selectedHuyen} onChange={(e) => setSelectedHuyen(e.target.value)} disabled={!selectedTinh}>
                        <option value="">Chọn Quận/Huyện</option>
                        {huyenList.map(h => <option key={h.maHuyen} value={h.maHuyen}>{h.tenHuyen}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <select value={selectedXa} onChange={(e) => setSelectedXa(e.target.value)} disabled={!selectedHuyen}>
                        <option value="">Chọn Phường/Xã</option>
                        {xaList.map(x => <option key={x.maXa} value={x.maXa}>{x.tenXa}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Số nhà, tên đường cụ thể"
                      value={diaChiChiTiet}
                      onChange={(e) => setDiaChiChiTiet(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="form-group mt-15">
                <input
                  type="text"
                  placeholder="Lưu ý, yêu cầu khác (Không bắt buộc)"
                  value={ghiChu}
                  onChange={(e) => setGhiChu(e.target.value)}
                />
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary & Payment */}
          <div className="checkout-right">
            <section className="checkout-summary-box">
              <h3>Tóm tắt đơn hàng</h3>

              <div className="summary-items-list">
                {cart.items.map(item => (
                  <div className="sum-item" key={item.productId}>
                    <img src={item.image || '/placeholder.png'} alt={item.name} />
                    <div className="sum-item-info">
                      <p className="sum-item-name">{item.name}</p>
                      <p className="sum-item-qty">Số lượng: x{item.quantity}</p>
                    </div>
                    <div className="sum-item-price">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-calc">
                <div className="calc-row">
                  <span>Tiền sản phẩm:</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cart.totalAmount)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="calc-row" style={{ color: '#16a34a' }}>
                    <span>Giảm giá ({appliedCoupon.phanTramGiam}%):</span>
                    <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}</span>
                  </div>
                )}
                <div className="calc-row">
                  <span>Tiền giao hàng:</span>
                  <span>{phiVanChuyen > 0 ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(phiVanChuyen) : '0 ₫'}</span>
                </div>
              </div>

              {/* Coupon Input */}
              <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '14px', marginTop: '4px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Mã khuyến mãi</div>
                {appliedCoupon ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '10px 14px'
                  }}>
                    <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>
                      ✓ {appliedCoupon.tenKM} (-{appliedCoupon.phanTramGiam}%)
                    </span>
                    <button type="button" onClick={handleRemoveCoupon}
                      style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Nhập mã KM (VD: 1, 2, 3...)"
                        value={couponInput}
                        onChange={e => { setCouponInput(e.target.value); setCouponMsg(''); }}
                        style={{
                          flex: 1, padding: '9px 14px', border: '1px solid #d1d5db',
                          borderRadius: '8px', fontSize: '0.875rem', outline: 'none'
                        }}
                      />
                      <button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponInput.trim()}
                        style={{
                          background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px',
                          padding: '9px 16px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
                          opacity: couponLoading || !couponInput.trim() ? 0.6 : 1
                        }}>
                        {couponLoading ? '...' : 'Áp dụng'}
                      </button>
                    </div>
                    {couponMsgText && (
                      <div style={{
                        marginTop: '6px', fontSize: '0.8rem', fontWeight: 600,
                        color: couponMsg === 'success' ? '#16a34a' : '#dc2626'
                      }}>
                        {couponMsgText}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="summary-total-final">
                <span>Tổng tiền:</span>
                <span className="final-price">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                    cart.totalAmount - discountAmount + phiVanChuyen
                  )}
                </span>
              </div>
            </section>

            <section className="checkout-payment-box">
              <h3>Hình thức thanh toán</h3>
              <div className="payment-methods">
                <label className="payment-option">
                  <input type="radio" value="Tiền mặt" checked={paymentMethod === 'Tiền mặt'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  Thanh toán khi nhận hàng (COD)
                </label>
                <label className="payment-option">
                  <input type="radio" value="VNPay" checked={paymentMethod === 'VNPay'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  Thanh toán VNPay
                </label>
              </div>

              <button type="submit" className="btn-confirm-order" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'XÁC NHẬN ĐẶT HÀNG'}
              </button>
            </section>
          </div>
        </form>
      </div>

      {/* VNPAY RESULT MODAL */}
      {vnpayResult && (
        <div className="vnpay-overlay" onClick={() => { 
          if (vnpayResult.status === 'success') {
            navigate('/');
          } else {
            setVnpayResult(null); 
            pendingOrderRef.current = null;
          }
        }}>
          <div className="vnpay-modal" onClick={e => e.stopPropagation()}>
            <div className={`vnpay-modal-header ${vnpayResult.status === 'success' ? 'success' : 'fail'}`}>
              {vnpayResult.status === 'success' ? (
                <FaCheckCircle className="vnpay-icon" />
              ) : (
                <FaTimesCircle className="vnpay-icon" />
              )}
              <h2>
                {vnpayResult.status === 'success' ? 'Thanh toán VNPay thành công!' : 'Thanh toán VNPay thất bại!'}
              </h2>
            </div>
            <div className="vnpay-modal-body">
              {vnpayResult.status === 'success' ? (
                <div className="vnpay-info-box success">
                  <div className="vnpay-info-row">
                    <span>Mã đơn hàng:</span>
                    <strong>{vnpayResult.orderId || '—'}</strong>
                  </div>
                  <div className="vnpay-info-row">
                    <span>Mã giao dịch:</span>
                    <strong>{vnpayResult.transactionId || '—'}</strong>
                  </div>
                  <p className="vnpay-thanks">Cảm ơn bạn đã mua hàng! Đơn hàng của bạn đã được ghi nhận.</p>
                </div>
              ) : (
                <p className="vnpay-fail-msg">
                  Giao dịch bị hủy hoặc xảy ra lỗi. Mã tham chiếu: {vnpayResult.orderId || '—'}
                </p>
              )}
              <button
                className={`vnpay-close-btn ${vnpayResult.status === 'success' ? 'success' : ''}`}
                onClick={() => { 
                  if (vnpayResult.status === 'success') {
                    navigate('/');
                  } else {
                    setVnpayResult(null); 
                    pendingOrderRef.current = null;
                  }
                }}
              >
                {vnpayResult.status === 'success' ? 'Tiếp tục mua sắm' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL CONFIRMATION MODAL */}
      {showCancelConfirm && (
        <div className="vnpay-overlay">
          <div className="vnpay-modal" onClick={e => e.stopPropagation()}>
            <div className="vnpay-modal-header warning">
              <h2>Bạn có muốn tiếp tục thanh toán đơn hàng không?</h2>
            </div>
            <div className="vnpay-modal-body">
              <p style={{ color: '#64748b', marginBottom: 24 }}>
                Bạn đã đóng cửa sổ thanh toán VNPay. Nếu hủy, đơn hàng sẽ bị hủy bỏ.
              </p>
              <div className="vnpay-confirm-btns">
                <button className="vnpay-btn-continue" onClick={() => {
                  setShowCancelConfirm(false);
                  // Re-open VNPay for same order
                  const maDonHang = pendingOrderRef.current;
                  if (maDonHang) {
                    (async () => {
                      try {
                        const orderRes = await api.get(`don-hang/${maDonHang}`);
                        const tongTien = orderRes.data?.data?.tongTien;
                        const vnpayRes = await api.get('vnpay/create-payment', {
                          params: { amount: tongTien, orderInfo: 'Thanh toan don hang DH_' + maDonHang, txnRef: 'DH_' + maDonHang }
                        });
                        if (vnpayRes.data?.url) {
                          const w = 1280, h = 700;
                          const left = (screen.width - w) / 2;
                          const top = (screen.height - h) / 2;
                          const popup = window.open(vnpayRes.data.url, 'vnpay_popup', `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes`);
                          const timer = setInterval(() => {
                            if (popup && popup.closed) {
                              clearInterval(timer);
                              if (pendingOrderRef.current) setShowCancelConfirm(true);
                            }
                          }, 1000);
                        }
                      } catch (e) { console.error(e); }
                    })();
                  }
                }}>
                  Tiếp tục thanh toán
                </button>
                <button className="vnpay-btn-cancel" onClick={handleCancelOrder}>
                  Hủy đơn hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
