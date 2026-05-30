import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope, FaPhoneAlt, FaIdCard, FaGoogle, FaKey, FaBan } from 'react-icons/fa';
import authService from '../services/authService';
import { validateLoginForm, validateRegisterForm } from '../utils/authValidation';
import { useSettings } from '../context/SettingsContext';
import '../styles/pages/Login.css';

function Login() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (event) => {
    setErrorMessage('');
    setSuccessMessage('');
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const switchMode = (nextMode) => {
    setIsLogin(nextMode);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const persistAndRedirect = (user, message) => {
    setSuccessMessage(message);
    window.dispatchEvent(new Event('auth-changed'));
    
    // Check if user has ADMIN role (case insensitive or specific constant)
    const isAdmin = user?.roles?.some(role => role.toUpperCase() === 'ADMIN' || role === 'Quản trị viên');
    
    setTimeout(() => {
      navigate(isAdmin ? '/admin' : '/');
    }, 800);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      fullName: formData.fullName.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
    };

    const validationMessage = isLogin
      ? validateLoginForm({ username: payload.username, password: payload.password })
      : validateRegisterForm({ ...payload, confirmPassword: formData.confirmPassword });

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    // Enforce registration setting
    if (!isLogin && !settings.enableRegistration) {
      setErrorMessage('Chức năng đăng ký hiện đang bị tắt bởi quản trị viên.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      if (isLogin) {
        const user = await authService.login({
          username: payload.username,
          password: payload.password,
        });
        // If login disabled for guests, only allow admin
        const isAdmin = user?.roles?.some(role => role.toUpperCase() === 'ADMIN' || role === 'Quản trị viên');
        if (!settings.enableLogin && !isAdmin) {
          authService.logout();
          setErrorMessage('Chức năng đăng nhập dành cho khách hàng hiện đang bị tắt. Chỉ quản trị viên mới có thể đăng nhập.');
          return;
        }
        persistAndRedirect(user, 'Đăng nhập thành công.');
      } else {
        const user = await authService.register(payload);
        persistAndRedirect(user, 'Đăng ký thành công. Tài khoản của bạn đang có quyền Guest.');
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');
      await authService.loginWithGoogle(googleEmail.trim());
      persistAndRedirect('Đăng nhập Google thành công.');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestOtp = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      const response = await authService.requestOtp(otpIdentifier.trim());
      setSuccessMessage(`OTP demo của bạn là ${response.otp}.`);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginOtp = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await authService.loginWithOtp(otpIdentifier.trim(), otpCode.trim());
      persistAndRedirect('Đăng nhập OTP thành công.');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="login-container compact">
          <div className="login-header centered">
            <h1>{isLogin ? 'Đăng nhập tài khoản' : 'Đăng ký tài khoản'}</h1>
            <p>{isLogin ? 'Đăng nhập nhanh, gọn và an toàn.' : 'Tạo tài khoản mới để đặt hàng và theo dõi giỏ hàng theo phiên.'}</p>
          </div>

          {!settings.enableLogin && isLogin && (
            <div className="form-alert error" style={{ textAlign: 'center', marginBottom: 0 }}>
              ⚠️ Đăng nhập khách hàng đang tạm tắt. Chỉ quản trị viên mới có thể đăng nhập.
            </div>
          )}

          <div className="auth-toggle">
            <button type="button" className={isLogin ? 'active' : ''} onClick={() => switchMode(true)}>Đăng nhập</button>
            {settings.enableRegistration && (
              <button type="button" className={!isLogin ? 'active' : ''} onClick={() => switchMode(false)}>Đăng ký</button>
            )}
          </div>

          {/* Registration disabled notice */}
          {!isLogin && !settings.enableRegistration ? (
            <div className="login-blocked" style={{ padding: '30px 0' }}>
              <FaBan className="blocked-icon" style={{ fontSize: '2rem' }} />
              <h3>Đăng ký đã bị tắt</h3>
              <p>Quản trị viên đã tạm thời tắt chức năng đăng ký tài khoản mới.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form compact-form">
              {!isLogin && (
                <div className="form-group">
                  <label><FaUser /> Họ và tên</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nhập họ và tên" />
                </div>
              )}

              <div className="form-group">
                <label><FaIdCard /> Tên đăng nhập</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Ví dụ: hoanghao.pc" required />
              </div>

              {!isLogin && (
                <>
                  <div className="form-group">
                    <label><FaEnvelope /> Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Nhập email của bạn" />
                  </div>
                  <div className="form-group">
                    <label><FaPhoneAlt /> Số điện thoại</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Ví dụ: 0912345678" />
                  </div>
                </>
              )}

              <div className="form-group">
                <label><FaLock /> Mật khẩu</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Nhập mật khẩu" required />
              </div>

              {!isLogin && (
                <div className="form-group">
                  <label><FaLock /> Xác nhận mật khẩu</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Nhập lại mật khẩu" />
                </div>
              )}

              {errorMessage && <div className="form-alert error">{errorMessage}</div>}
              {successMessage && <div className="form-alert success">{successMessage}</div>}

              <button type="submit" className="btn-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            </form>
          )}

          {isLogin && settings.enableLogin && (
            <div className="quick-auth-simplified">
              <div className="divider">
                <span>hoặc</span>
              </div>
              <div className="social-buttons">
                <button type="button" className="btn-social google" onClick={() => { window.location.href = 'http://localhost:8080/oauth2/authorize/google?redirect_uri=http://localhost:5173/oauth2/redirect'; }} disabled={isSubmitting}>
                  <FaGoogle /> Đăng nhập bằng Google
                </button>
                
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
