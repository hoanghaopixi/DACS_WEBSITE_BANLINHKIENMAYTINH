package com.pcstore.repository;

import com.pcstore.entity.ChiTietGioHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChiTietGioHangRepository extends JpaRepository<ChiTietGioHang, ChiTietGioHang.ChiTietGioHangId> {
    List<ChiTietGioHang> findByGioHang_MaGioHang(Long maGioHang);
    Optional<ChiTietGioHang> findByGioHang_MaGioHangAndSanPham_MaSP(Long maGioHang, Long maSP);
    void deleteByGioHang_MaGioHangAndSanPham_MaSP(Long maGioHang, Long maSP);
    void deleteByGioHang_MaGioHang(Long maGioHang);
}
