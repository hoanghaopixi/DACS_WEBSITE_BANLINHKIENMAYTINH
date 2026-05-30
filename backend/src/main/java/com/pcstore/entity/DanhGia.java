package com.pcstore.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "DanhGia")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DanhGia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaDanhGia")
    private Long maDanhGia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaKH", nullable = false)
    private KhachHang khachHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaSP", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private SanPham sanPham;

    @Column(name = "DiemSao", nullable = false)
    private Integer diemSao;

    @Column(name = "NoiDung", columnDefinition = "TEXT")
    private String noiDung;

    @CreationTimestamp
    @Column(name = "NgayDanhGia", updatable = false)
    private LocalDateTime ngayDanhGia;

    @Column(name = "DaChinhSua")
    @Builder.Default
    private Boolean daChinhSua = false;

    @OneToMany(mappedBy = "danhGia", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<HinhAnhDanhGia> hinhAnhDanhGias;
}
