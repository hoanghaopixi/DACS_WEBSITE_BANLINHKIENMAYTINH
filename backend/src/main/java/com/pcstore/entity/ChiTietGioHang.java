package com.pcstore.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name = "ChiTietGioHang")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(ChiTietGioHang.ChiTietGioHangId.class)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ChiTietGioHang {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaGioHang")
    @JsonIgnore
    private GioHang gioHang;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaSP")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private SanPham sanPham;

    @Column(name = "SoLuong")
    @Builder.Default
    private Integer soLuong = 1;

    @Column(name = "DonGia", nullable = false, precision = 15, scale = 2)
    private java.math.BigDecimal donGia;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChiTietGioHangId implements Serializable {
        private Long gioHang;
        private Long sanPham;
    }
}
