package com.pcstore.repository;

import com.pcstore.entity.KhuyenMai;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface KhuyenMaiRepository extends JpaRepository<KhuyenMai, Long> {

    // Find active promotions (not expired, started)
    @Query("SELECT k FROM KhuyenMai k WHERE k.ngayBatDau <= :now AND k.ngayKetThuc >= :now")
    List<KhuyenMai> findActive(@Param("now") LocalDateTime now);

    // Check if customer already used this coupon (via HoaDon.maKM)
    // HoaDon tracks maKM used. We check if any hoadon of any donhang of this khachhang used this coupon.
    @Query(value = "SELECT COUNT(*) FROM HoaDon hd " +
                   "JOIN DonHang dh ON hd.MaDonHang = dh.MaDonHang " +
                   "WHERE dh.MaKH = :maKH AND hd.MaKM = :maKM", nativeQuery = true)
    int countUsageByCustomer(@Param("maKH") Long maKH, @Param("maKM") Long maKM);
}
