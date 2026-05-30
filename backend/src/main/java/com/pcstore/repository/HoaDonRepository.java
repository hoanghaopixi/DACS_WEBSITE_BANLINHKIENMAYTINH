package com.pcstore.repository;

import com.pcstore.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, Long> {
    List<HoaDon> findAllByOrderByMaHoaDonDesc();
    java.util.Optional<HoaDon> findByDonHang_MaDonHang(Long maDonHang);
}

