package com.pcstore.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "ChiTietPhieuNhap")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(ChiTietPhieuNhapId.class)
public class ChiTietPhieuNhap {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaPhieuNhap")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private PhieuNhap phieuNhap;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaSP")
    private SanPham sanPham;

    @Column(name = "SoLuong", nullable = false)
    private Integer soLuong;

    @Column(name = "DonGia", nullable = false, precision = 15, scale = 2)
    private BigDecimal donGia;

    @Column(name = "ThanhTien", precision = 15, scale = 2, insertable = false, updatable = false)
    private BigDecimal thanhTien;
}
