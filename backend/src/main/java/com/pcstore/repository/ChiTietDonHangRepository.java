package com.pcstore.repository;

import com.pcstore.entity.ChiTietDonHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietDonHangRepository extends JpaRepository<ChiTietDonHang, ChiTietDonHang.ChiTietDonHangId> {
    List<ChiTietDonHang> findByDonHang_MaDonHang(Long maDonHang);

    @Query("SELECT ct.sanPham.maSP, COALESCE(SUM(ct.soLuong), 0) FROM ChiTietDonHang ct WHERE ct.donHang.trangThai != 'Đã hủy' GROUP BY ct.sanPham.maSP")
    List<Object[]> getSoldQuantityMap();

    @Query(value = "SELECT sp.MaSP, sp.TenSP, SUM(ct.SoLuong) as totalQty, SUM(ct.SoLuong * ct.DonGia) as revenue " +
                   "FROM ChiTietDonHang ct " +
                   "JOIN SanPham sp ON ct.MaSP = sp.MaSP " +
                   "JOIN DonHang dh ON ct.MaDonHang = dh.MaDonHang " +
                   "JOIN HoaDon hd ON hd.MaDonHang = dh.MaDonHang " +
                   "WHERE hd.TrangThaiThanhToan = 'Đã thanh toán' " +
                   "GROUP BY sp.MaSP, sp.TenSP " +
                   "ORDER BY totalQty DESC", nativeQuery = true)
    List<Object[]> getTopSellingProducts(org.springframework.data.domain.Pageable pageable);

    @Query(value = "SELECT dm.TenDanhMuc, SUM(ct.SoLuong * ct.DonGia) as revenue " +
                   "FROM ChiTietDonHang ct " +
                   "JOIN SanPham sp ON ct.MaSP = sp.MaSP " +
                   "JOIN DanhMuc dm ON sp.MaDanhMuc = dm.MaDanhMuc " +
                   "JOIN DonHang dh ON ct.MaDonHang = dh.MaDonHang " +
                   "JOIN HoaDon hd ON hd.MaDonHang = dh.MaDonHang " +
                   "WHERE hd.TrangThaiThanhToan = 'Đã thanh toán' " +
                   "GROUP BY dm.MaDanhMuc, dm.TenDanhMuc " +
                   "ORDER BY revenue DESC", nativeQuery = true)
    List<Object[]> getRevenueByCategoryAdvanced(org.springframework.data.domain.Pageable pageable);

    @Query(value = "SELECT th.TenThuongHieu, SUM(ct.SoLuong * ct.DonGia) as revenue " +
                   "FROM ChiTietDonHang ct " +
                   "JOIN SanPham sp ON ct.MaSP = sp.MaSP " +
                   "JOIN ThuongHieu th ON sp.MaThuongHieu = th.MaThuongHieu " +
                   "JOIN DonHang dh ON ct.MaDonHang = dh.MaDonHang " +
                   "JOIN HoaDon hd ON hd.MaDonHang = dh.MaDonHang " +
                   "WHERE hd.TrangThaiThanhToan = 'Đã thanh toán' " +
                   "GROUP BY th.MaThuongHieu, th.TenThuongHieu " +
                   "ORDER BY revenue DESC", nativeQuery = true)
    List<Object[]> getRevenueByBrandAdvanced(org.springframework.data.domain.Pageable pageable);
}

