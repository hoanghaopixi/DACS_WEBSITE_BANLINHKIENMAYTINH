package com.pcstore.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "SanPham")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SanPham {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaSP")
    private Long maSP;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaDanhMuc", nullable = false)
    private DanhMuc danhMuc;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaThuongHieu", nullable = false)
    private ThuongHieu thuongHieu;

    @Column(name = "GiaKM", precision = 15, scale = 2)
    private BigDecimal giaKM;

    @Column(name = "TenSP", nullable = false, length = 150)
    private String tenSP;

    @Column(name = "GiaNhap", nullable = false, precision = 15, scale = 2)
    private BigDecimal giaNhap;

    @Column(name = "GiaBan", nullable = false, precision = 15, scale = 2)
    private BigDecimal giaBan;

    @Column(name = "SoLuongTon")
    @Builder.Default
    private Integer soLuongTon = 0;

    @Column(name = "TonToiThieu")
    @Builder.Default
    private Integer tonToiThieu = 0;

    @Column(name = "MoTa", columnDefinition = "TEXT")
    private String moTa;

    @Column(name = "BaoHanh")
    @Builder.Default
    private Integer baoHanh = 0;

    @Column(name = "HinhAnh")
    private String hinhAnh;

    @CreationTimestamp
    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "sanPham", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private java.util.List<HinhAnhSanPham> hinhAnhSanPhams;

    @OneToMany(mappedBy = "sanPham", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.List<DanhGia> danhGias;
}
