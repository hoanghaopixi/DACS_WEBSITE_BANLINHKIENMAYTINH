package com.pcstore.repository;

import com.pcstore.entity.DonHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DonHangRepository extends JpaRepository<DonHang, Long> {
    List<DonHang> findByKhachHang_MaKH(Long maKH);
    List<DonHang> findAllByOrderByMaDonHangDesc();

    @Query(value = "SELECT SUM(hd.TongTien) FROM HoaDon hd " +
                   "WHERE hd.TrangThaiThanhToan = 'Đã thanh toán'", nativeQuery = true)
    java.math.BigDecimal getTotalRevenue();

    @Query(value = "SELECT DATE_FORMAT(dh.NgayDat, '%d/%m') as ngay, SUM(ct.SoLuong * ct.DonGia) as amount " +
                   "FROM ChiTietDonHang ct " +
                   "JOIN DonHang dh ON ct.MaDonHang = dh.MaDonHang " +
                   "JOIN HoaDon hd ON hd.MaDonHang = dh.MaDonHang " +
                   "WHERE dh.NgayDat >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) " +
                   "AND hd.TrangThaiThanhToan = 'Đã thanh toán' " +
                   "GROUP BY DATE_FORMAT(dh.NgayDat, '%d/%m'), DATE(dh.NgayDat) " +
                   "ORDER BY DATE(dh.NgayDat) ASC", nativeQuery = true)
    List<Object[]> getDailyRevenueLast7Days();
}
