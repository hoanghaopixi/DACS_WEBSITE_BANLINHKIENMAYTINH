package com.pcstore.controller;

import com.pcstore.dto.request.LoginRequest;
import com.pcstore.dto.request.GoogleLoginRequest;
import com.pcstore.dto.request.OtpLoginRequest;
import com.pcstore.dto.request.OtpRequest;
import com.pcstore.dto.request.RegisterRequest;
import com.pcstore.dto.response.ApiResponse;
import com.pcstore.dto.response.AuthResponse;
import com.pcstore.dto.response.OtpResponse;
import com.pcstore.service.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<AuthResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Đăng ký tài khoản thành công")
                .data(authService.register(request))
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Đăng nhập thành công")
                .data(authService.login(request))
                .build());
    }

    @PostMapping("/otp/request")
    public ResponseEntity<ApiResponse<OtpResponse>> requestOtp(@Valid @RequestBody OtpRequest request, HttpSession session) {
        return ResponseEntity.ok(ApiResponse.<OtpResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Đã tạo OTP")
                .data(authService.requestOtp(request, session))
                .build());
    }

    @PostMapping("/otp/login")
    public ResponseEntity<ApiResponse<AuthResponse>> loginWithOtp(@Valid @RequestBody OtpLoginRequest request, HttpSession session) {
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Đăng nhập OTP thành công")
                .data(authService.loginWithOtp(request, session))
                .build());
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Đăng nhập Google thành công")
                .data(authService.loginWithGoogle(request))
                .build());
    }

    @PutMapping("/{id}/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody com.pcstore.dto.request.ChangePasswordRequest request) {
        authService.changePassword(id, request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Đổi mật khẩu thành công")
                .build());
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser(@com.pcstore.security.CurrentUser com.pcstore.security.UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy thông tin người dùng thành công")
                .data(authService.getCurrentUser(userPrincipal.getId()))
                .build());
    }

    @PutMapping("/{id}/avatar")
    public ResponseEntity<ApiResponse<Void>> updateAvatar(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        authService.updateAvatar(id, body.get("anhDaiDien"));
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Cập nhật ảnh đại diện thành công")
                .build());
    }
}
