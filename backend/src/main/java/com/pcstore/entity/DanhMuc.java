package com.pcstore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "DanhMuc")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DanhMuc {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaDanhMuc")
    private Long maDanhMuc;

    @Column(name = "TenDanhMuc", nullable = false, unique = true, length = 100)
    private String tenDanhMuc;

    @Column(name = "MoTa", columnDefinition = "TEXT")
    private String moTa;
}
