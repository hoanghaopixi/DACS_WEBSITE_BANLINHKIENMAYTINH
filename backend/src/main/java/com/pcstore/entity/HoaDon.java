package com.pcstore.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "HoaDon")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HoaDon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaHoaDon")
    private Long maHoaDon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaDonHang", nullable = false)
    private DonHang donHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaNV")
    private NhanVien nhanVien;

    @CreationTimestamp
    @Column(name = "NgayLap", updatable = false)
    private LocalDateTime ngayLap;

    @Column(name = "TongTien", nullable = false, precision = 15, scale = 2)
    private BigDecimal tongTien;

    @Column(name = "TrangThaiThanhToan")
    @Builder.Default
    private String trangThaiThanhToan = "Chưa thanh toán";

    @Column(name = "HinhThucThanhToan")
    @Builder.Default
    private String hinhThucThanhToan = "Tiền mặt";

    @Column(name = "ThoiDiemThanhToan")
    private LocalDateTime thoiDiemThanhToan;

    @Column(name = "KhuyenMai", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal khuyenMai = BigDecimal.ZERO;

    @Column(name = "MaKM")
    private Long maKM; // Track which coupon was used


    @Column(name = "VAT", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal vat = new BigDecimal("8.00");

    @Column(name = "PhiDichVu", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal phiDichVu = BigDecimal.ZERO;

    // VNPay Fields
    @Column(name = "Vnp_TxnRef", length = 100)
    private String vnpTxnRef;

    @Column(name = "Vnp_TransactionNo", length = 100)
    private String vnpTransactionNo;

    @Column(name = "Vnp_BankCode", length = 50)
    private String vnpBankCode;

    @Column(name = "Vnp_PayDate", length = 14)
    private String vnpPayDate;

    @Column(name = "Vnp_OrderInfo", length = 255)
    private String vnpOrderInfo;
}
