package com.pcstore.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Table(name = "ChiTietDonHang")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(ChiTietDonHang.ChiTietDonHangId.class)
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ChiTietDonHang {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaDonHang")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("chiTietDonHangs")
    private DonHang donHang;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaSP")
    private SanPham sanPham;

    @Column(name = "SoLuong", nullable = false)
    private Integer soLuong;

    @Column(name = "DonGia", nullable = false, precision = 15, scale = 2)
    private BigDecimal donGia;

    @Column(name = "ThanhTien", updatable = false, insertable = false, precision = 15, scale = 2)
    private BigDecimal thanhTien;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChiTietDonHangId implements Serializable {
        private Long donHang;
        private Long sanPham;
    }
}
