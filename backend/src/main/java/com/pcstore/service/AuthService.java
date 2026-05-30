package com.pcstore.service;

import com.pcstore.dto.request.LoginRequest;
import com.pcstore.dto.request.GoogleLoginRequest;
import com.pcstore.dto.request.OtpLoginRequest;
import com.pcstore.dto.request.OtpRequest;
import com.pcstore.dto.request.RegisterRequest;
import com.pcstore.dto.response.AuthResponse;
import com.pcstore.dto.response.OtpResponse;
import jakarta.servlet.http.HttpSession;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    OtpResponse requestOtp(OtpRequest request, HttpSession session);
    AuthResponse loginWithOtp(OtpLoginRequest request, HttpSession session);
    AuthResponse loginWithGoogle(GoogleLoginRequest request);
    void changePassword(Long maTK, String oldPassword, String newPassword);
    AuthResponse getCurrentUser(Long maTK);
    void updateAvatar(Long maTK, String anhDaiDien);
}
