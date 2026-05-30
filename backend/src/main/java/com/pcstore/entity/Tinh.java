package com.pcstore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Tinh")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Tinh {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaTinh")
    private Long maTinh;

    @Column(name = "TenTinh", nullable = false, unique = true, length = 100)
    private String tenTinh;
}
