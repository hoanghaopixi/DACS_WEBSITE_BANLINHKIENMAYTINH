package com.pcstore.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "DonHang")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DonHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaDonHang")
    private Long maDonHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaKH", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private KhachHang khachHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaNV")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private NhanVien nhanVien;

    @CreationTimestamp
    @Column(name = "NgayDat", updatable = false)
    private LocalDateTime ngayDat;

    @Column(name = "TongTien", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal tongTien = BigDecimal.ZERO;

    @Column(name = "TrangThai")
    @Builder.Default
    private String trangThai = "Chờ xác nhận";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaXa", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Xa xa;

    @Column(name = "DiaChiChiTiet", nullable = false, length = 255)
    private String diaChiChiTiet;

    @Column(name = "TenNguoiNhan", nullable = false, length = 100)
    private String tenNguoiNhan;

    @Column(name = "SDTNguoiNhan", nullable = false, length = 15)
    private String sdtNguoiNhan;

    @Column(name = "PhiVanChuyen", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal phiVanChuyen = BigDecimal.ZERO;

    @Column(name = "GhiChu", length = 255)
    private String ghiChu;

    @Column(name = "MaKM")
    private Long maKM;

    @Column(name = "SoTienGiam", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal soTienGiam = BigDecimal.ZERO;

    @Column(name = "HinhThucThanhToan")
    @Builder.Default
    private String hinhThucThanhToan = "Tiền mặt";

    @OneToMany(mappedBy = "donHang", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("donHang")
    private java.util.List<ChiTietDonHang> chiTietDonHangs;
}
