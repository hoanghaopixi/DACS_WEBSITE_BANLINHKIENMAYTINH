package com.pcstore.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "ChiTietBaiViet")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietBaiViet {

    @Id
    @Column(name = "MaBaiViet")
    private Long maBaiViet;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "MaBaiViet")
    @JsonIgnore // Prevent circular JSON
    private BaiViet baiViet;

    @Column(name = "NoiDung", columnDefinition = "LONGTEXT")
    private String noiDung;

    @Column(name = "HinhAnh", length = 255)
    private String hinhAnh;
}
