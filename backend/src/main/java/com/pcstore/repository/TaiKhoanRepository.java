package com.pcstore.repository;

import com.pcstore.entity.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Long> {
    Optional<TaiKhoan> findByTenDangNhapIgnoreCase(String tenDangNhap);
    Optional<TaiKhoan> findByEmailIgnoreCase(String email);
    Optional<TaiKhoan> findBySoDienThoai(String soDienThoai);
    boolean existsByTenDangNhapIgnoreCase(String tenDangNhap);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsBySoDienThoai(String soDienThoai);
}
