import React, { useState, useEffect } from 'react';
import {
  FaFont, FaSun,
  FaSave, FaUndo, FaCheckCircle, FaStore, FaDesktop
} from 'react-icons/fa';
import { useSettings, FONTS } from '../../context/SettingsContext';
import '../../styles/pages/Settings.css';
import '../../styles/pages/CommonAdmin.css';

/* ---- Các sub-component khai báo NGOÀI để tránh re-mount mỗi lần render ---- */
const Toggle = ({ checked, onChange }) => (
  <label className="toggle-switch">
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
    <span className="toggle-slider" />
  </label>
);

const Item = ({ label, desc, children }) => (
  <div className="settings-item">
    <div className="settings-item-info">
      <div className="settings-item-label">{label}</div>
      {desc && <div className="settings-item-desc">{desc}</div>}
    </div>
    <div className="settings-item-control">{children}</div>
  </div>
);

const InputItem = ({ label, desc, value, onChange, placeholder, isTextArea }) => (
  <div className="settings-item" style={{ alignItems: 'flex-start' }}>
    <div className="settings-item-info" style={{ flex: '0 0 250px', marginTop: '8px' }}>
      <div className="settings-item-label">{label}</div>
      {desc && <div className="settings-item-desc">{desc}</div>}
    </div>
    <div className="settings-item-control" style={{ flex: 1, width: '100%' }}>
      {isTextArea ? (
        <textarea className="settings-input" value={value} onChange={onChange} placeholder={placeholder} style={{ width: '100%', minHeight: 80, padding: '10px 14px', resize: 'vertical' }} />
      ) : (
        <input className="settings-input" value={value} onChange={onChange} placeholder={placeholder} style={{ width: '100%' }} />
      )}
    </div>
  </div>
);

const Card = ({ icon, iconColor, title, desc, children }) => (
  <div className="settings-card">
    <div className="settings-card-header">
      <div className={`settings-card-icon ${iconColor}`}>{icon}</div>
      <div>
        <div className="settings-card-title">{title}</div>
        <div className="settings-card-desc">{desc}</div>
      </div>
    </div>
    {children}
  </div>
);

const SystemSettings = () => {
  const {
    settings,
    isDirty,
    updateDraftSetting,
    startEditing,
    commitSettings,
    revertSettings,
    resetSettings,
  } = useSettings();

  const [toast, setToast] = useState(null);

  // Initialize draft when entering settings page
  useEffect(() => {
    startEditing();
  }, [startEditing]);

  // Handle browser tab close / refresh with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = () => {
    commitSettings();
    showToast('Đã lưu cài đặt thành công!');
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc muốn khôi phục cài đặt mặc định?')) {
      resetSettings();
      startEditing();
      showToast('Đã khôi phục cài đặt mặc định!');
    }
  };

  return (
    <div className="admin-page settings-page">
      {/* ===== STICKY HEADER ===== */}
      <div className="admin-header-flex">
        <div className="settings-header-left">
          <h1 className="admin-title">Cài đặt hệ thống</h1>
          {isDirty && (
            <div className="unsaved-badge">
              <span className="unsaved-dot" />
              Có thay đổi chưa lưu
            </div>
          )}
        </div>
        <div className="settings-header-actions">
          <button className="btn-reset" onClick={handleReset}>
            <FaUndo /> Khôi phục mặc định
          </button>
          <button className={`btn-save ${isDirty ? 'btn-save-pulse' : ''}`} onClick={handleSave} disabled={!isDirty}>
            <FaSave /> Lưu cài đặt
          </button>
        </div>
      </div>

      {/* ===== SCROLLABLE CONTENT ===== */}
      <div className="admin-page-body">
        {/* ===== 1. CHẾ ĐỘ SÁNG / TỐI ===== */}
        <Card icon={<FaSun />} iconColor="orange" title="Chế độ hiển thị" desc="Cài đặt sáng tối, hiệu ứng, thanh bên">
          <Item label="Chế độ màu" desc="Chọn chế độ hiển thị cho trang web">
            <div className="theme-options">
              {[
                { key: 'light', label: 'Sáng' },
                { key: 'dark', label: 'Tối' },
                { key: 'auto', label: 'Tự động' },
              ].map(t => (
                <div key={t.key} onClick={() => updateDraftSetting('theme', t.key)}>
                  <div className={`theme-option ${settings.theme === t.key ? 'active' : ''}`}>
                    {t.key === 'light' && <div className="theme-light-preview" />}
                    {t.key === 'dark' && <div className="theme-dark-preview" />}
                    {t.key === 'auto' && <><div className="theme-auto-top" /><div className="theme-auto-bottom" /></>}
                  </div>
                  <div className="theme-label">{t.label}</div>
                </div>
              ))}
            </div>
          </Item>

          <Item label="Hiệu ứng chuyển động" desc="Bật / tắt hiệu ứng cho toàn bộ trang web">
            <Toggle checked={settings.animationsEnabled} onChange={v => updateDraftSetting('animationsEnabled', v)} />
          </Item>

          <Item label="Thanh bên thu gọn" desc="Thu gọn sidebar để có nhiều không gian hơn">
            <Toggle checked={settings.compactMode} onChange={v => updateDraftSetting('compactMode', v)} />
          </Item>
        </Card>

        {/* ===== 2. PHÔNG CHỮ & MÀU SẮC ===== */}
        <Card icon={<FaFont />} iconColor="purple" title="Phông chữ & Màu sắc" desc="Tuỳ chỉnh phông chữ và màu chủ đạo cho toàn bộ trang web">
          <Item label="Phông chữ" desc="Đổi font cho toàn bộ trang web">
            <select
              className="settings-select"
              value={settings.fontFamily}
              onChange={e => updateDraftSetting('fontFamily', e.target.value)}
            >
              {FONTS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </Item>

          <Item label="Cỡ chữ" desc="Kích thước chữ mặc định (px)">
            <div className="settings-slider-group">
              <input
                type="range" className="settings-slider"
                min={12} max={20} value={settings.fontSize}
                onChange={e => updateDraftSetting('fontSize', +e.target.value)}
              />
              <span className="slider-value">{settings.fontSize}px</span>
            </div>
          </Item>

          <div className="font-preview">
            <div className="font-preview-label">Xem trước</div>
            <div
              className="font-preview-text"
              style={{ fontFamily: settings.fontFamily, fontSize: settings.fontSize }}
            >
              Hoàng Hảo PC —  AaBbCc 0123456789
            </div>
          </div>

          <Item label="Màu chủ đạo" desc="Chọn màu sắc chủ đạo cho nút bấm, liên kết, sidebar">
            <div className="color-picker-group">
              <input
                type="color" className="color-picker-input"
                value={settings.primaryColor}
                onChange={e => updateDraftSetting('primaryColor', e.target.value)}
              />
              <span className="color-value">{settings.primaryColor}</span>
            </div>
          </Item>
        </Card>

        {/* ===== 3. THÔNG TIN CỬA HÀNG & MẠNG XÃ HỘI ===== */}
        <Card icon={<FaStore />} iconColor="blue" title="Thông tin cửa hàng" desc="Thông tin hiển thị trên website ở phần footer">
          <InputItem label="Tên cửa hàng" value={settings.siteName} onChange={e => updateDraftSetting('siteName', e.target.value)} />
          <InputItem label="Mô tả ngắn" value={settings.siteDescription} onChange={e => updateDraftSetting('siteDescription', e.target.value)} />
          <InputItem label="Mô tả chi tiết" value={settings.siteDetail} onChange={e => updateDraftSetting('siteDetail', e.target.value)} isTextArea={true} />
          <InputItem label="Số điện thoại" value={settings.contactPhone} onChange={e => updateDraftSetting('contactPhone', e.target.value)} />
          <InputItem label="Email liên hệ" value={settings.contactEmail} onChange={e => updateDraftSetting('contactEmail', e.target.value)} />
          <InputItem label="Địa chỉ" value={settings.address} onChange={e => updateDraftSetting('address', e.target.value)} />
          
          <div style={{ borderTop: '1px solid var(--border-color)', margin: '16px 0' }}></div>
          
          <InputItem label="Facebook" placeholder="https://facebook.com/..." value={settings.socialFacebook} onChange={e => updateDraftSetting('socialFacebook', e.target.value)} />
          <InputItem label="YouTube" placeholder="https://youtube.com/..." value={settings.socialYoutube} onChange={e => updateDraftSetting('socialYoutube', e.target.value)} />
          <InputItem label="Zalo OA" placeholder="https://zalo.me/..." value={settings.socialZalo} onChange={e => updateDraftSetting('socialZalo', e.target.value)} />
          <InputItem label="Instagram" placeholder="https://instagram.com/..." value={settings.socialInstagram} onChange={e => updateDraftSetting('socialInstagram', e.target.value)} />
        </Card>

        {/* ===== 4. TUỲ CHỌN HIỂN THỊ ===== */}
        <Card icon={<FaDesktop />} iconColor="green" title="Quản lý truy cập" desc="Quản lý quyền truy cập của khách hàng">
          <Item label="Cho phép đăng ký" desc="Cho phép khách tạo tài khoản mới">
            <Toggle checked={settings.enableRegistration} onChange={v => updateDraftSetting('enableRegistration', v)} />
          </Item>

          <Item label="Cho phép khách đăng nhập" desc="Cho phép khách hàng đăng nhập vào hệ thống">
            <Toggle checked={settings.enableLogin} onChange={v => updateDraftSetting('enableLogin', v)} />
          </Item>
        </Card>
      </div>

      {toast && (
        <div className="settings-toast">
          <FaCheckCircle /> {toast}
        </div>
      )}
    </div>
  );
};

export default SystemSettings;
