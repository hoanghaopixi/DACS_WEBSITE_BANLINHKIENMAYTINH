export const USERNAME_REGEX = /^[a-zA-Z0-9._]{4,20}$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{8,32}$/;
export const PHONE_REGEX = /^(0|\+84)[3-9][0-9]{8}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegisterForm = ({ fullName, username, email, phone, password, confirmPassword }) => {
  if (!fullName.trim()) {
    return 'Họ và tên không được để trống.';
  }
  if (!USERNAME_REGEX.test(username)) {
    return 'Tên đăng nhập phải dài 4-20 ký tự và chỉ gồm chữ, số, dấu chấm hoặc gạch dưới.';
  }
  if (!EMAIL_REGEX.test(email)) {
    return 'Email không đúng định dạng.';
  }
  if (!PHONE_REGEX.test(phone)) {
    return 'Số điện thoại phải đúng định dạng Việt Nam.';
  }
  if (!PASSWORD_REGEX.test(password)) {
    return 'Mật khẩu phải dài 8-32 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.';
  }
  if (password !== confirmPassword) {
    return 'Xác nhận mật khẩu không khớp.';
  }

  return '';
};

export const validateLoginForm = ({ username, password }) => {
  if (!USERNAME_REGEX.test(username)) {
    return 'Tên đăng nhập không hợp lệ.';
  }
  if (!PASSWORD_REGEX.test(password)) {
    return 'Mật khẩu không hợp lệ.';
  }

  return '';
};

export const validateChangePasswordForm = ({ oldPassword, newPassword, confirmPassword }) => {
  if (!oldPassword.trim()) {
    return 'Mật khẩu cũ không được để trống.';
  }
  if (!PASSWORD_REGEX.test(newPassword)) {
    return 'Mật khẩu mới phải dài 8-32 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.';
  }
  if (newPassword !== confirmPassword) {
    return 'Xác nhận mật khẩu không khớp.';
  }
  return '';
};
