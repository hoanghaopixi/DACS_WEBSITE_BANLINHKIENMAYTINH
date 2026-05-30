package com.pcstore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "QuangCao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuangCao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaQuangCao")
    private Long maQuangCao;

    @Column(name = "TieuDe", nullable = false, length = 255)
    private String tieuDe;

    @Column(name = "HinhAnh", length = 255)
    private String hinhAnh;

    @Column(name = "LinkRedirect", length = 255)
    private String linkRedirect;
}
