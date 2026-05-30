import React, { useRef, useEffect, useState } from 'react';
import { FaTimes, FaPrint } from 'react-icons/fa';
import api from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

// Convert number to Vietnamese words
const numberToVietnameseWords = (num) => {
  if (num === 0) return 'Không đồng';
  const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const readGroup = (n) => {
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const u = n % 10;
    let s = '';
    if (h > 0) s += units[h] + ' trăm ';
    if (t > 1) { s += units[t] + ' mươi '; if (u === 1) s += 'mốt '; else if (u === 5) s += 'lăm '; else if (u > 0) s += units[u] + ' '; }
    else if (t === 1) { s += 'mười '; if (u === 5) s += 'lăm '; else if (u > 0) s += units[u] + ' '; }
    else if (t === 0 && h > 0 && u > 0) { s += 'lẻ ' + units[u] + ' '; }
    else if (u > 0) { s += units[u] + ' '; }
    return s.trim();
  };
  const groups = [];
  const groupNames = ['', 'nghìn', 'triệu', 'tỷ'];
  let temp = Math.round(num);
  while (temp > 0) { groups.push(temp % 1000); temp = Math.floor(temp / 1000); }
  let result = '';
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] > 0) {
      result += readGroup(groups[i]) + ' ' + groupNames[i] + ' ';
    }
  }
  result = result.trim();
  return result.charAt(0).toUpperCase() + result.slice(1) + ' đồng';
};

const InvoicePrintModal = ({ invoice, onClose }) => {
  const printRef = useRef(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  const storeName = settings.siteName || 'HOÀNG HẢO PC';
  const storeDesc = settings.siteDescription || 'Giải pháp linh kiện và cấu hình máy tính cho nhu cầu học tập, làm việc và gaming.';
  const storeAddress = settings.address || 'Khu CNC Quận 9, TP. Hồ Chí Minh';
  const storePhone = settings.contactPhone || '0909 123 456';
  const storeEmail = settings.contactEmail || 'support@hoanghaopc.vn';

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`don-hang/${invoice.donHang?.maDonHang}`);
        if (res.data?.code === 200) setOrderDetails(res.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    if (invoice.donHang?.maDonHang) fetchOrder();
    else setLoading(false);
  }, [invoice]);

  const handlePrint = () => {
    const content = printRef.current;
    const win = window.open('', '_blank', 'width=800,height=900');
    win.document.write(`
      <html>
      <head>
        <title>Hóa đơn #${invoice.maHoaDon}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Times New Roman', serif; margin: 0; padding: 20px; color: #000; font-size: 14px; }
          .invoice-container { max-width: 700px; margin: 0 auto; }
          .store-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
          .store-name { font-size: 22px; font-weight: bold; text-transform: uppercase; color: #1a237e; margin: 0; }
          .store-info { font-size: 12px; color: #555; margin: 3px 0; }
          .invoice-title { text-align: center; margin: 20px 0; }
          .invoice-title h2 { font-size: 20px; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
          .invoice-meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; }
          .invoice-meta div { flex: 1; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #333; padding: 8px 10px; }
          th { background: #f0f0f0; font-weight: bold; text-align: center; font-size: 13px; }
          td { font-size: 13px; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .total-row td { font-weight: bold; font-size: 14px; }
          .amount-words { font-style: italic; margin: 10px 0; font-size: 13px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px dashed #999; }
          .thank-you { font-size: 16px; font-weight: bold; color: #1a237e; margin-bottom: 5px; }
          .footer-sub { font-size: 12px; color: #777; }
          .signatures { display: flex; justify-content: space-between; margin-top: 40px; text-align: center; }
          .signatures div { width: 45%; }
          .signatures .role { font-weight: bold; margin-bottom: 60px; }
          .signatures .note { font-size: 11px; font-style: italic; color: #888; }
        </style>
      </head>
      <body>${content.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const formatMoney = (val) => new Intl.NumberFormat('vi-VN').format(val || 0) + ' đ';
  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const items = orderDetails?.chiTietDonHangs || [];
  const tongTien = invoice.tongTien || 0;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 780,
        maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>
            Xem trước hóa đơn #{invoice.maHoaDon}
          </h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handlePrint} disabled={loading} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8,
              fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem'
            }}>
              <FaPrint /> In hóa đơn
            </button>
            <button onClick={onClose} style={{
              background: '#f1f5f9', border: 'none', borderRadius: '50%',
              width: 36, height: 36, cursor: 'pointer', color: '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}><FaTimes /></button>
          </div>
        </div>

        {/* Print Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px', background: '#f1f5f9' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>Đang tải dữ liệu...</div>
          ) : (
            <div style={{ background: '#fff', padding: '40px', maxWidth: 700, margin: '0 auto', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 4 }}>
              <div ref={printRef}>
                <div className="invoice-container">
                  {/* Store Header */}
                  <div style={{ textAlign: 'center', marginBottom: 20, borderBottom: '2px solid #333', paddingBottom: 15 }}>
                    <p style={{ fontSize: 22, fontWeight: 'bold', textTransform: 'uppercase', color: '#1a237e', margin: 0 }}>
                      {storeName}
                    </p>
                    <p style={{ fontSize: 12, color: '#555', margin: '3px 0' }}>{storeDesc}</p>
                    <p style={{ fontSize: 12, color: '#555', margin: '3px 0' }}>Địa chỉ: {storeAddress} | ĐT: {storePhone}</p>
                    <p style={{ fontSize: 12, color: '#555', margin: '3px 0' }}>Email: {storeEmail}</p>
                  </div>

                  {/* Invoice Title */}
                  <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <h2 style={{ fontSize: 20, margin: 0, textTransform: 'uppercase', letterSpacing: 2 }}>
                      HÓA ĐƠN BÁN HÀNG
                    </h2>
                  </div>

                  {/* Invoice Meta */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontSize: 13 }}>
                    <div>
                      <p style={{ margin: '4px 0' }}><strong>Mã HĐ:</strong> #{invoice.maHoaDon}</p>
                      <p style={{ margin: '4px 0' }}><strong>Khách hàng:</strong> {invoice.donHang?.khachHang?.hoTen || 'Khách vãng lai'}</p>
                      <p style={{ margin: '4px 0' }}><strong>SĐT:</strong> {orderDetails?.sdtNguoiNhan || invoice.donHang?.khachHang?.sdt || '—'}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: '4px 0' }}><strong>Nhân viên:</strong> {invoice.nhanVien?.hoTen || 'Hệ thống'}</p>
                      <p style={{ margin: '4px 0' }}><strong>Thời gian TT:</strong> {formatDate(invoice.thoiDiemThanhToan || invoice.ngayLap)}</p>
                      <p style={{ margin: '4px 0' }}><strong>Hình thức TT:</strong> {invoice.hinhThucThanhToan}</p>
                    </div>
                  </div>

                  {/* Product Table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', margin: '15px 0' }}>
                    <thead>
                      <tr>
                        <th style={{ border: '1px solid #333', padding: '8px', background: '#f0f0f0', width: 40 }}>STT</th>
                        <th style={{ border: '1px solid #333', padding: '8px', background: '#f0f0f0' }}>Tên sản phẩm</th>
                        <th style={{ border: '1px solid #333', padding: '8px', background: '#f0f0f0', width: 60 }}>SL</th>
                        <th style={{ border: '1px solid #333', padding: '8px', background: '#f0f0f0', width: 110 }}>Đơn giá</th>
                        <th style={{ border: '1px solid #333', padding: '8px', background: '#f0f0f0', width: 120 }}>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length > 0 ? items.map((ct, idx) => (
                        <tr key={idx}>
                          <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>{idx + 1}</td>
                          <td style={{ border: '1px solid #333', padding: '8px' }}>{ct.sanPham?.tenSP || 'Sản phẩm'}</td>
                          <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>{ct.soLuong}</td>
                          <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'right' }}>{formatMoney(ct.donGia)}</td>
                          <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'right' }}>{formatMoney(ct.soLuong * ct.donGia)}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" style={{ border: '1px solid #333', padding: 12, textAlign: 'center', color: '#999' }}>
                            Không có dữ liệu sản phẩm
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="4" style={{ border: '1px solid #333', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                          Tổng tiền:
                        </td>
                        <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'right', fontWeight: 'bold', fontSize: 15 }}>
                          {formatMoney(tongTien)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Amount in words */}
                  <p style={{ fontStyle: 'italic', margin: '10px 0', fontSize: 13 }}>
                    <strong>Số tiền viết bằng chữ:</strong> {numberToVietnameseWords(tongTien)}
                  </p>

                  {/* Signatures */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, textAlign: 'center' }}>
                    <div style={{ width: '45%' }}>
                      <p style={{ fontWeight: 'bold', marginBottom: 60 }}>Khách hàng</p>
                      <p style={{ fontSize: 11, fontStyle: 'italic', color: '#888' }}>(Ký, ghi rõ họ tên)</p>
                    </div>
                    <div style={{ width: '45%' }}>
                      <p style={{ fontWeight: 'bold', marginBottom: 60 }}>Người bán hàng</p>
                      <p style={{ fontSize: 11, fontStyle: 'italic', color: '#888' }}>(Ký, ghi rõ họ tên)</p>
                    </div>
                  </div>

                  {/* Thank you */}
                  <div style={{ textAlign: 'center', marginTop: 30, paddingTop: 15, borderTop: '1px dashed #999' }}>
                    <p style={{ fontSize: 16, fontWeight: 'bold', color: '#1a237e', margin: '0 0 5px' }}>
                      Cảm ơn Quý khách đã mua hàng!
                    </p>
                    <p style={{ fontSize: 12, color: '#777', margin: 0 }}>
                      Mọi thắc mắc xin liên hệ: {storePhone} | {storeEmail}
                    </p>
                    <p style={{ fontSize: 11, color: '#aaa', marginTop: 5 }}>
                      {storeName} — Uy tín tạo nên thương hiệu
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintModal;
