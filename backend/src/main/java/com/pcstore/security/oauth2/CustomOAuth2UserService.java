package com.pcstore.security.oauth2;

import com.pcstore.entity.KhachHang;
import com.pcstore.entity.TaiKhoan;
import com.pcstore.entity.VaiTro;
import com.pcstore.exception.OAuth2AuthenticationProcessingException;
import com.pcstore.repository.KhachHangRepository;
import com.pcstore.repository.TaiKhoanRepository;
import com.pcstore.repository.VaiTroRepository;
import com.pcstore.security.UserPrincipal;
import com.pcstore.security.oauth2.user.OAuth2UserInfo;
import com.pcstore.security.oauth2.user.OAuth2UserInfoFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final TaiKhoanRepository taiKhoanRepository;
    private final KhachHangRepository khachHangRepository;
    private final VaiTroRepository vaiTroRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        log.info("=== OAuth2 loadUser CALLED ===");
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);
        log.info("OAuth2 user loaded from provider: {}", oAuth2User.getAttributes().get("email"));

        try {
            return processOAuth2User(oAuth2UserRequest, oAuth2User);
        } catch (AuthenticationException ex) {
            log.error("OAuth2 AuthenticationException: {}", ex.getMessage(), ex);
            throw ex;
        } catch (Exception ex) {
            log.error("OAuth2 UNEXPECTED Exception: {}", ex.getMessage(), ex);
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(oAuth2UserRequest.getClientRegistration().getRegistrationId(), oAuth2User.getAttributes());
        if(!StringUtils.hasText(oAuth2UserInfo.getEmail())) {
            throw new OAuth2AuthenticationProcessingException("Email not found from OAuth2 provider");
        }

        log.info("Processing OAuth2 user with email: {}", oAuth2UserInfo.getEmail());

        TaiKhoan.AuthProvider requestedProvider = TaiKhoan.AuthProvider.valueOf(oAuth2UserRequest.getClientRegistration().getRegistrationId());

        Optional<TaiKhoan> userOptional = taiKhoanRepository.findByEmailIgnoreCase(oAuth2UserInfo.getEmail());
        TaiKhoan user;
        if(userOptional.isPresent()) {
            user = userOptional.get();
            log.info("Found existing user: maTK={}, provider={}", user.getMaTK(), user.getProvider());
            // If existing user has no provider (legacy account) or is local, link to Google
            if(user.getProvider() == null || user.getProvider() == TaiKhoan.AuthProvider.local) {
                log.info("Linking legacy/local account to Google");
                user.setProvider(requestedProvider);
                user.setProviderId(oAuth2UserInfo.getId());
            } else if(!user.getProvider().equals(requestedProvider)) {
                throw new OAuth2AuthenticationProcessingException("Looks like you're signed up with " +
                        user.getProvider() + " account. Please use your " + user.getProvider() +
                        " account to login.");
            }
            user = updateExistingUser(user, oAuth2UserInfo);
        } else {
            log.info("No existing user found, registering new user");
            user = registerNewUser(oAuth2UserRequest, oAuth2UserInfo);
        }

        log.info("OAuth2 user processed successfully: maTK={}", user.getMaTK());
        return UserPrincipal.create(user, oAuth2User.getAttributes());
    }

    private TaiKhoan registerNewUser(OAuth2UserRequest oAuth2UserRequest, OAuth2UserInfo oAuth2UserInfo) {
        // Check if KhachHang already exists with this email (avoid duplicate entry)
        KhachHang kh = khachHangRepository.findByEmailIgnoreCase(oAuth2UserInfo.getEmail())
                .orElseGet(() -> {
                    KhachHang newKh = new KhachHang();
                    newKh.setHoTen(oAuth2UserInfo.getName());
                    newKh.setEmail(oAuth2UserInfo.getEmail());
                    return khachHangRepository.save(newKh);
                });
        log.info("Using KhachHang: maKH={}", kh.getMaKH());

        TaiKhoan user = new TaiKhoan();
        user.setProvider(TaiKhoan.AuthProvider.valueOf(oAuth2UserRequest.getClientRegistration().getRegistrationId()));
        user.setProviderId(oAuth2UserInfo.getId());
        user.setKhachHang(kh);
        user.setTenDangNhap(oAuth2UserInfo.getEmail()); // Use email as username
        user.setEmail(oAuth2UserInfo.getEmail());
        user.setMatKhau(""); // No password for OAuth2 users
        user.setAnhDaiDien(oAuth2UserInfo.getImageUrl());
        user.setNgayTao(LocalDateTime.now());
        user.setLanDangNhapCuoi(LocalDateTime.now());
        user.setTrangThai(true);

        VaiTro role = vaiTroRepository.findByTenVaiTroIgnoreCase("Guest")
                .orElseGet(() -> vaiTroRepository.save(VaiTro.builder().tenVaiTro("Guest").moTa("Guest role").build()));
        user.getVaiTros().add(role);

        TaiKhoan saved = taiKhoanRepository.save(user);
        log.info("Saved new TaiKhoan: maTK={}", saved.getMaTK());
        return saved;
    }

    private TaiKhoan updateExistingUser(TaiKhoan existingUser, OAuth2UserInfo oAuth2UserInfo) {
        // Fetch KhachHang by ID to ensure it's a managed entity (avoid lazy proxy issues)
        if (existingUser.getKhachHang() != null && existingUser.getKhachHang().getMaKH() != null) {
            KhachHang kh = khachHangRepository.findById(existingUser.getKhachHang().getMaKH()).orElse(null);
            if (kh != null) {
                kh.setHoTen(oAuth2UserInfo.getName());
                khachHangRepository.save(kh);
                log.info("Updated KhachHang: maKH={}", kh.getMaKH());
            }
        }
        existingUser.setAnhDaiDien(oAuth2UserInfo.getImageUrl());
        existingUser.setLanDangNhapCuoi(LocalDateTime.now());
        TaiKhoan saved = taiKhoanRepository.save(existingUser);
        log.info("Updated existing TaiKhoan: maTK={}", saved.getMaTK());
        return saved;
    }
}
