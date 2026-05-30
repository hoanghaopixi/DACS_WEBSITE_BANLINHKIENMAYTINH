package com.pcstore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ThuongHieu")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ThuongHieu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaThuongHieu")
    private Long maThuongHieu;

    @Column(name = "TenThuongHieu", nullable = false, unique = true, length = 100)
    private String tenThuongHieu;

    @Column(name = "QuocGia", length = 100)
    private String quocGia;

    @Column(name = "Website")
    private String website;

    @Column(name = "Logo")
    private String logo;
}
