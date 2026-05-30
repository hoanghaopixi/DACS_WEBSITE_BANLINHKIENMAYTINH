package com.pcstore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "HinhAnhSanPham")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HinhAnhSanPham {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaHinhAnh")
    private Long maHinhAnh;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaSP", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private SanPham sanPham;

    @Column(name = "Url", nullable = false, length = 500)
    private String url;

    @Column(name = "Loai")
    @Builder.Default
    private String loai = "IMAGE"; // IMAGE or VIDEO
}
