import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { FaTimes, FaShieldAlt, FaExchangeAlt, FaShoppingBag, FaCreditCard } from 'react-icons/fa';
import './Footer.css';

const policyData = {
  warranty: {
    icon: <FaShieldAlt />,
    title: 'Chính sách bảo hành',
    content: (
      <>
        <h4>1. Điều kiện bảo hành</h4>
        <ul>
          <li>Sản phẩm còn trong thời hạn bảo hành (theo phiếu bảo hành hoặc hóa đơn mua hàng).</li>
          <li>Tem bảo hành, serial number còn nguyên vẹn, không bị rách, tẩy xóa.</li>
          <li>Sản phẩm bị lỗi kỹ thuật do nhà sản xuất (lỗi phần cứng, lỗi linh kiện).</li>
          <li>Sản phẩm không có dấu hiệu tác động vật lý (va đập, vào nước, cháy nổ).</li>
        </ul>
        <h4>2. Thời gian bảo hành</h4>
        <ul>
          <li>Thời gian bảo hành theo quy định của từng hãng sản xuất, thông thường từ <strong>12 – 36 tháng</strong>.</li>
          <li>Thời gian xử lý bảo hành: <strong>7 – 21 ngày làm việc</strong> (tùy theo tình trạng lỗi và hãng sản xuất).</li>
        </ul>
        <h4>3. Trường hợp không được bảo hành</h4>
        <ul>
          <li>Sản phẩm hết hạn bảo hành.</li>
          <li>Sản phẩm bị hư hỏng do sử dụng sai cách, tự ý tháo lắp, sửa chữa.</li>
          <li>Sản phẩm bị hư hỏng do thiên tai, hỏa hoạn, nguồn điện không ổn định.</li>
          <li>Không có hóa đơn mua hàng hoặc phiếu bảo hành hợp lệ.</li>
        </ul>
        <h4>4. Quy trình bảo hành</h4>
        <ol>
          <li>Khách hàng liên hệ hotline hoặc mang sản phẩm đến cửa hàng.</li>
          <li>Nhân viên tiếp nhận, kiểm tra và xác nhận tình trạng lỗi.</li>
          <li>Gửi sản phẩm đến trung tâm bảo hành của hãng (nếu cần).</li>
          <li>Thông báo kết quả và trả sản phẩm cho khách hàng.</li>
        </ol>
      </>
    ),
  },
  exchange: {
    icon: <FaExchangeAlt />,
    title: 'Chính sách đổi trả',
    content: (
      <>
        <h4>1. Điều kiện đổi trả</h4>
        <ul>
          <li>Sản phẩm còn nguyên hộp, phụ kiện, tem niêm phong, chưa qua sử dụng.</li>
          <li>Thời gian đổi trả trong vòng <strong>7 ngày</strong> kể từ ngày nhận hàng.</li>
          <li>Sản phẩm bị lỗi kỹ thuật từ nhà sản xuất (không phải do người dùng gây ra).</li>
        </ul>
        <h4>2. Các trường hợp được đổi trả</h4>
        <ul>
          <li>Sản phẩm bị lỗi phần cứng ngay khi mở hộp.</li>
          <li>Giao nhầm sản phẩm, sai model, sai cấu hình.</li>
          <li>Sản phẩm bị hư hỏng trong quá trình vận chuyển.</li>
        </ul>
        <h4>3. Các trường hợp KHÔNG được đổi trả</h4>
        <ul>
          <li>Sản phẩm đã qua sử dụng, có dấu hiệu trầy xước, va đập.</li>
          <li>Sản phẩm đã bóc tem, mở seal, thiếu phụ kiện đi kèm.</li>
          <li>Khách đổi ý, không muốn sử dụng (không phải lỗi sản phẩm).</li>
          <li>Sản phẩm thuộc chương trình khuyến mãi, giảm giá đặc biệt.</li>
        </ul>
        <h4>4. Quy trình đổi trả</h4>
        <ol>
          <li>Liên hệ hotline hoặc inbox Fanpage để thông báo.</li>
          <li>Gửi hình ảnh/video lỗi sản phẩm (nếu có).</li>
          <li>Mang sản phẩm đến cửa hàng hoặc gửi qua đường bưu điện.</li>
          <li>Nhận sản phẩm mới hoặc hoàn tiền trong vòng <strong>3 – 5 ngày làm việc</strong>.</li>
        </ol>
      </>
    ),
  },
  guide: {
    icon: <FaShoppingBag />,
    title: 'Hướng dẫn mua hàng',
    content: (
      <>
        <h4>Cách 1: Mua hàng trực tiếp tại cửa hàng</h4>
        <ol>
          <li>Đến trực tiếp cửa hàng Hoàng Hảo PC.</li>
          <li>Nhân viên tư vấn sẽ hỗ trợ bạn chọn sản phẩm phù hợp.</li>
          <li>Thanh toán và nhận hàng ngay tại quầy.</li>
        </ol>
        <h4>Cách 2: Mua hàng Online trên Website</h4>
        <ol>
          <li><strong>Bước 1:</strong> Truy cập website và tìm kiếm sản phẩm cần mua.</li>
          <li><strong>Bước 2:</strong> Nhấn <strong>"Thêm vào giỏ hàng"</strong> hoặc <strong>"Đặt mua ngay"</strong>.</li>
          <li><strong>Bước 3:</strong> Kiểm tra giỏ hàng, điều chỉnh số lượng nếu cần.</li>
          <li><strong>Bước 4:</strong> Nhấn <strong>"Tiến hành thanh toán"</strong> và điền thông tin giao hàng.</li>
          <li><strong>Bước 5:</strong> Chọn phương thức thanh toán và xác nhận đơn hàng.</li>
          <li><strong>Bước 6:</strong> Chờ nhân viên xác nhận và giao hàng tận nơi.</li>
        </ol>
        <h4>Cách 3: Mua qua Hotline / Zalo</h4>
        <ol>
          <li>Gọi hotline hoặc nhắn tin Zalo cho cửa hàng.</li>
          <li>Cung cấp tên sản phẩm, số lượng, thông tin nhận hàng.</li>
          <li>Xác nhận đơn hàng và chờ giao hàng.</li>
        </ol>
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, padding: '12px 16px', marginTop: 16 }}>
          <strong style={{ color: '#065f46' }}>💡 Mẹo:</strong>
          <span style={{ color: '#065f46' }}> Đăng ký tài khoản để theo dõi đơn hàng và nhận ưu đãi thành viên!</span>
        </div>
      </>
    ),
  },
  payment: {
    icon: <FaCreditCard />,
    title: 'Phương thức thanh toán',
    content: (
      <>
        <h4>1. Thanh toán khi nhận hàng (COD)</h4>
        <p>Khách hàng thanh toán trực tiếp cho nhân viên giao hàng bằng <strong>tiền mặt</strong> khi nhận sản phẩm. Áp dụng cho đơn hàng nội thành và ngoại thành.</p>

        <h4>2. Thanh toán qua VNPay</h4>
        <p>Hỗ trợ thanh toán online qua cổng <strong>VNPay</strong> — quét mã QR hoặc thanh toán bằng thẻ ATM/Visa/Mastercard. An toàn, nhanh chóng, tự động xác nhận.</p>

        <h4>3. Thanh toán tại cửa hàng</h4>
        <p>Khách hàng mua trực tiếp tại cửa hàng có thể thanh toán bằng <strong>tiền mặt</strong> hoặc <strong>quẹt thẻ</strong>.</p>

        <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, padding: '12px 16px', marginTop: 16 }}>
          <strong style={{ color: '#92400e' }}>⚠️ Lưu ý:</strong>
          <span style={{ color: '#92400e' }}> Vui lòng giữ hóa đơn thanh toán để đối chiếu khi cần thiết.</span>
        </div>
      </>
    ),
  },
};

const Footer = () => {
  const { settings } = useSettings();
  const [activePolicy, setActivePolicy] = useState(null);

  const openPolicy = (key) => (e) => {
    e.preventDefault();
    setActivePolicy(key);
  };

  const closePolicy = () => setActivePolicy(null);

  const policy = activePolicy ? policyData[activePolicy] : null;

  return (
    <>
      <footer className="site-footer">
        <div className="container footer-shell">
          <div className="footer-top">
            <div className="footer-brand">
              <span className="footer-badge">{settings.siteName || 'HOÀNG HẢO PC'}</span>
              <h3>{settings.siteDescription || 'Giải pháp linh kiện và cấu hình máy tính cho nhu cầu học tập, làm việc và gaming.'}</h3>
  
              <div className="footer-contact">
                <h4>Thông tin liên hệ</h4>
                <p>Địa chỉ: {settings.address || 'Khu CNC Quận 9, TP. Hồ Chí Minh'}</p>
                <p>Hotline: {settings.contactPhone || '0909 123 456'}</p>
                <p>Email: {settings.contactEmail || 'support@hoanghaopc.vn'}</p>
              </div>
            </div>

            <div className="footer-grid">
              <div className="footer-card">
                <h4>Hỗ trợ khách hàng</h4>
                <a href="#" onClick={openPolicy('warranty')}>Chính sách bảo hành</a>
                <a href="#" onClick={openPolicy('exchange')}>Chính sách đổi trả</a>
                <a href="#" onClick={openPolicy('guide')}>Hướng dẫn mua hàng</a>
                <a href="#" onClick={openPolicy('payment')}>Phương thức thanh toán</a>
              </div>

              <div className="footer-card">
                <h4>Kết nối nhanh</h4>
                <a href={settings.socialFacebook || '#'}>Facebook</a>
                <a href={settings.socialYoutube || '#'}>YouTube</a>
                <a href={settings.socialZalo || '#'}>Zalo OA</a>
                <a href={settings.socialInstagram || '#'}>Instagram</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} {settings.siteName || 'HOÀNG HẢO PC'}. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* Policy Modal */}
      {policy && (
        <div className="policy-modal-overlay" onClick={closePolicy}>
          <div className="policy-modal" onClick={e => e.stopPropagation()}>
            <div className="policy-modal-header">
              <div className="policy-modal-icon">{policy.icon}</div>
              <h2>{policy.title}</h2>
              <button className="policy-modal-close" onClick={closePolicy}><FaTimes /></button>
            </div>
            <div className="policy-modal-body">
              {policy.content}
            </div>
            <div className="policy-modal-footer">
              <p>Mọi thắc mắc xin liên hệ: <strong>{settings.contactPhone || '0909 123 456'}</strong> | <strong>{settings.contactEmail || 'support@hoanghaopc.vn'}</strong></p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
