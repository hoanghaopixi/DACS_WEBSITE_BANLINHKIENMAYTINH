package com.pcstore.repository;

import com.pcstore.entity.DanhGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DanhGiaRepository extends JpaRepository<DanhGia, Long> {
    List<DanhGia> findBySanPham_MaSPOrderByNgayDanhGiaDesc(Long maSP);
    Optional<DanhGia> findByKhachHang_MaKHAndSanPham_MaSP(Long maKH, Long maSP);
}
