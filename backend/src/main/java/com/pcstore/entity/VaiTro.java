package com.pcstore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vaitro")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VaiTro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaVaiTro")
    private Long maVaiTro;

    @Column(name = "TenVaiTro", nullable = false, unique = true, length = 50)
    private String tenVaiTro;

    @Column(name = "MoTa")
    private String moTa;
}
