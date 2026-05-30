package com.pcstore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "HinhAnhDanhGia")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HinhAnhDanhGia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaHinhAnh")
    private Long maHinhAnh;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaDanhGia", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private DanhGia danhGia;

    @Column(name = "Url", nullable = false, length = 500)
    private String url;

    @Column(name = "Loai")
    @Builder.Default
    private String loai = "IMAGE"; // IMAGE or VIDEO
}
