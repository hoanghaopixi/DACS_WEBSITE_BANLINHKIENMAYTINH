package com.pcstore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Huyen")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Huyen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaHuyen")
    private Long maHuyen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaTinh", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Tinh tinh;

    @Column(name = "TenHuyen", nullable = false, length = 100)
    private String tenHuyen;
}
