package com.pcstore.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "KhuyenMai")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KhuyenMai {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaKM")
    private Long maKM;

    @Column(name = "TenKM", nullable = false, length = 150)
    private String tenKM;

    @Column(name = "PhanTramGiam", precision = 5, scale = 2)
    private BigDecimal phanTramGiam;

    @Column(name = "NgayBatDau", nullable = false)
    private LocalDateTime ngayBatDau;

    @Column(name = "NgayKetThuc", nullable = false)
    private LocalDateTime ngayKetThuc;

    @Column(name = "DieuKienApDung", columnDefinition = "TEXT")
    private String dieuKienApDung;
}
