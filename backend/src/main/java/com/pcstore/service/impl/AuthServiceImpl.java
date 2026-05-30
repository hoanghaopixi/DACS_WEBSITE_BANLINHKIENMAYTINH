package com.pcstore.service.impl;

import com.pcstore.dto.request.LoginRequest;
import com.pcstore.dto.request.GoogleLoginRequest;
import com.pcstore.dto.request.OtpLoginRequest;
import com.pcstore.dto.request.OtpRequest;
import com.pcstore.dto.request.RegisterRequest;
import com.pcstore.dto.response.AuthResponse;
import com.pcstore.dto.response.OtpResponse;
import com.pcstore.entity.KhachHang;
import com.pcstore.entity.TaiKhoan;
import com.pcstore.entity.VaiTro;
import com.pcstore.repository.KhachHangRepository;
import com.pcstore.repository.TaiKhoanRepository;
import com.pcstore.repository.VaiTroRepository;
import com.pcstore.service.AuthService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private static final String DEFAULT_ROLE_NAME = "Guest";
    private static final String OTP_SESSION_KEY = "PC_STORE_AUTH_OTP";

    private final TaiKhoanRepository taiKhoanRepository;
    private final VaiTroRepository vaiTroRepository;
    private final KhachHangRepository khachHangRepository;
    private final com.pcstore.security.TokenProvider tokenProvider;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();
        String phone = request.getPhone().trim();

        if (taiKhoanRepository.existsByTenDangNhapIgnoreCase(username)) {
            throw new IllegalArgumentException("Tên đăng nhập đã tồn tại");
        }
        if (taiKhoanRepository.existsByEmailIgnoreCase(email) || khachHangRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email đã được sử dụng");
        }
        if (taiKhoanRepository.existsBySoDienThoai(phone) || khachHangRepository.existsBySdt(phone)) {
            throw new IllegalArgumentException("Số điện thoại đã được sử dụng");
        }

        KhachHang khachHang = KhachHang.builder()
                .hoTen(request.getFullName().trim())
                .email(email)
                .sdt(phone)
                .build();
        KhachHang savedKhachHang = khachHangRepository.save(khachHang);

        VaiTro guestRole = vaiTroRepository.findByTenVaiTroIgnoreCase(DEFAULT_ROLE_NAME)
                .orElseGet(() -> vaiTroRepository.save(VaiTro.builder()
                        .tenVaiTro(DEFAULT_ROLE_NAME)
                        .moTa("Quyền mặc định cho tài khoản mới đăng ký")
                        .build()));

        TaiKhoan taiKhoan = TaiKhoan.builder()
                .khachHang(savedKhachHang)
                .tenDangNhap(username)
                .matKhau(passwordEncoder.encode(request.getPassword()))
                .email(email)
                .soDienThoai(phone)
                .trangThai(true)
                .ngayTao(LocalDateTime.now())
                .build();
        taiKhoan.getVaiTros().add(guestRole);

        TaiKhoan savedTaiKhoan = taiKhoanRepository.save(taiKhoan);
        return toAuthResponse(savedTaiKhoan);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhapIgnoreCase(request.getUsername().trim())
                .orElseThrow(() -> new IllegalArgumentException("Tên đăng nhập hoặc mật khẩu không đúng"));

        if (Boolean.FALSE.equals(taiKhoan.getTrangThai())) {
            throw new IllegalArgumentException("Tài khoản đã bị khóa");
        }
        if (!passwordEncoder.matches(request.getPassword(), taiKhoan.getMatKhau())) {
            throw new IllegalArgumentException("Tên đăng nhập hoặc mật khẩu không đúng");
        }

        taiKhoan.setLanDangNhapCuoi(LocalDateTime.now());
        TaiKhoan savedTaiKhoan = taiKhoanRepository.save(taiKhoan);
        return toAuthResponse(savedTaiKhoan);
    }

    @Override
    public OtpResponse requestOtp(OtpRequest request, HttpSession session) {
        TaiKhoan taiKhoan = findByIdentifier(request.getIdentifier().trim());
        String otp = String.format("%06d", new Random().nextInt(1_000_000));
        session.setAttribute(OTP_SESSION_KEY + ":" + normalizeIdentifier(request.getIdentifier()), otp);

        return OtpResponse.builder()
                .identifier(taiKhoan.getTenDangNhap())
                .otp(otp)
                .note("OTP demo cho môi trường phát triển. Tích hợp SMS/Email sau.")
                .build();
    }

    @Override
    @Transactional
    public AuthResponse loginWithOtp(OtpLoginRequest request, HttpSession session) {
        String sessionKey = OTP_SESSION_KEY + ":" + normalizeIdentifier(request.getIdentifier());
        Object storedOtp = session.getAttribute(sessionKey);
        if (storedOtp == null || !storedOtp.toString().equals(request.getOtp().trim())) {
            throw new IllegalArgumentException("OTP không đúng hoặc đã hết hạn");
        }

        TaiKhoan taiKhoan = findByIdentifier(request.getIdentifier().trim());
        if (Boolean.FALSE.equals(taiKhoan.getTrangThai())) {
            throw new IllegalArgumentException("Tài khoản đã bị khóa");
        }

        session.removeAttribute(sessionKey);
        taiKhoan.setLanDangNhapCuoi(LocalDateTime.now());
        return toAuthResponse(taiKhoanRepository.save(taiKhoan));
    }

    @Override
    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        TaiKhoan taiKhoan = taiKhoanRepository.findByEmailIgnoreCase(request.getEmail().trim())
                .orElseThrow(() -> new IllegalArgumentException("Email Google chưa được liên kết với tài khoản nào"));

        if (Boolean.FALSE.equals(taiKhoan.getTrangThai())) {
            throw new IllegalArgumentException("Tài khoản đã bị khóa");
        }

        taiKhoan.setLanDangNhapCuoi(LocalDateTime.now());
        return toAuthResponse(taiKhoanRepository.save(taiKhoan));
    }

    @Override
    @Transactional
    public void changePassword(Long maTK, String oldPassword, String newPassword) {
        TaiKhoan taiKhoan = taiKhoanRepository.findById(maTK)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản"));

        if (!passwordEncoder.matches(oldPassword, taiKhoan.getMatKhau())) {
            throw new IllegalArgumentException("Mật khẩu cũ không chính xác");
        }

        taiKhoan.setMatKhau(passwordEncoder.encode(newPassword));
        taiKhoanRepository.save(taiKhoan);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse getCurrentUser(Long maTK) {
        TaiKhoan taiKhoan = taiKhoanRepository.findById(maTK)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản"));
        return toAuthResponse(taiKhoan);
    }

    private AuthResponse toAuthResponse(TaiKhoan taiKhoan) {
        List<String> roles = taiKhoan.getVaiTros().stream()
                .map(VaiTro::getTenVaiTro)
                .sorted(Comparator.naturalOrder())
                .toList();

        String token = tokenProvider.createToken(taiKhoan);

        // Ưu tiên: NV > KH cho fullName hiển thị
        String displayName = null;
        if (taiKhoan.getNhanVien() != null && taiKhoan.getNhanVien().getHoTen() != null) {
            displayName = taiKhoan.getNhanVien().getHoTen();
        } else if (taiKhoan.getKhachHang() != null && taiKhoan.getKhachHang().getHoTen() != null) {
            displayName = taiKhoan.getKhachHang().getHoTen();
        }

        return AuthResponse.builder()
                .maTK(taiKhoan.getMaTK())
                .maKH(taiKhoan.getKhachHang() != null ? taiKhoan.getKhachHang().getMaKH() : null)
                .username(taiKhoan.getTenDangNhap())
                .fullName(displayName)
                .email(taiKhoan.getEmail())
                .phone(taiKhoan.getSoDienThoai())
                .anhDaiDien(taiKhoan.getAnhDaiDien())
                .provider(taiKhoan.getProvider() != null ? taiKhoan.getProvider().name() : "local")
                .active(taiKhoan.getTrangThai())
                .roles(roles)
                .accessToken(token)
                .tokenType("Bearer")
                .build();
    }

    @Override
    @Transactional
    public void updateAvatar(Long maTK, String anhDaiDien) {
        TaiKhoan taiKhoan = taiKhoanRepository.findById(maTK)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản"));
        taiKhoan.setAnhDaiDien(anhDaiDien);
        taiKhoanRepository.save(taiKhoan);
    }

    private TaiKhoan findByIdentifier(String identifier) {
        return taiKhoanRepository.findByTenDangNhapIgnoreCase(identifier)
                .or(() -> taiKhoanRepository.findBySoDienThoai(identifier))
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản tương ứng"));
    }

    private String normalizeIdentifier(String identifier) {
        return identifier.trim().toLowerCase();
    }
}
