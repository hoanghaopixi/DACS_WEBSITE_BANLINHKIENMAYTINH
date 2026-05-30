import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');
  const transactionId = searchParams.get('transactionId');
  
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // If opened in a popup from admin, send result back and close
    if (window.opener) {
      try {
        window.opener.postMessage({
          type: 'VNPAY_RESULT',
          status: status === 'success' ? 'success' : 'fail',
          orderId: orderId,
          transactionId: transactionId
        }, '*');
      } catch (e) {
        console.error('Could not post message to opener:', e);
      }
      // Close this popup window after a short delay
      setTimeout(() => window.close(), 500);
      return;
    }

    // Normal behavior for customer page
    setShowToast(true);
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [status, orderId, transactionId]);

  const isSuccess = status === 'success';

  return (
    <div style={{ padding: '60px 20px', minHeight: '60vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Thông báo đẩy (Toast Notification) */}
      {showToast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: isSuccess ? '#10b981' : '#ef4444', color: '#fff',
          padding: '16px 24px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: '12px',
          animation: 'slideInRight 0.3s ease-out forwards'
        }}>
          {isSuccess ? <FaCheckCircle size={24} /> : <FaTimesCircle size={24} />}
          <div>
            <div style={{ fontWeight: 700 }}>{isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
              {isSuccess ? 'Đơn hàng của bạn đã được ghi nhận thanh toán.' : 'Có lỗi xảy ra hoặc giao dịch bị hủy.'}
            </div>
          </div>
          <button onClick={() => setShowToast(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '10px' }}>×</button>
        </div>
      )}

      {/* Giao diện chính */}
      <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        {isSuccess ? (
          <>
            <FaCheckCircle style={{ color: '#10b981', fontSize: '80px', marginBottom: '20px' }} />
            <h2 style={{ color: '#0f172a', marginBottom: '10px' }}>Thanh toán VNPay Thành Công</h2>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>
              Cảm ơn bạn đã mua sắm tại cửa hàng. Giao dịch đã được hoàn tất.
            </p>
            <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '12px', textAlign: 'left', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#475569' }}>Mã giao dịch:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{transactionId || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Mã đơn hàng:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{orderId || 'N/A'}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <FaTimesCircle style={{ color: '#ef4444', fontSize: '80px', marginBottom: '20px' }} />
            <h2 style={{ color: '#0f172a', marginBottom: '10px' }}>Thanh toán Thất Bại</h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              Giao dịch của bạn đã bị hủy hoặc xảy ra lỗi trong quá trình xử lý. Mã giao dịch: {orderId}
            </p>
          </>
        )}

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate('/account')}
            style={{ padding: '12px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
          >
            Về trang tài khoản
          </button>
          <Link 
            to="/"
            style={{ padding: '12px 24px', background: '#e2e8f0', color: '#475569', textDecoration: 'none', borderRadius: '8px', fontWeight: 600 }}
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
      
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default PaymentResult;
