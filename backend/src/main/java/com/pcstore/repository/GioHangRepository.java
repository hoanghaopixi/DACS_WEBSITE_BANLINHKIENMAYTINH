package com.pcstore.repository;

import com.pcstore.entity.GioHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GioHangRepository extends JpaRepository<GioHang, Long> {
    List<GioHang> findAllByOrderByMaGioHangDesc();
    Optional<GioHang> findByKhachHang_MaKH(Long maKH);
}
