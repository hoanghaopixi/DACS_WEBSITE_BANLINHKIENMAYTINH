package com.pcstore.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "BaiViet")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BaiViet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaBaiViet")
    private Long maBaiViet;

    @Column(name = "TieuDe", nullable = false, length = 255)
    private String tieuDe;

    @CreationTimestamp
    @Column(name = "NgayDang", updatable = false)
    private LocalDateTime ngayDang;

    @Column(name = "NguoiViet", length = 100)
    private String nguoiViet;

    @Column(name = "NoiDung", columnDefinition = "LONGTEXT")
    private String noiDung; // Dữ liệu tóm tắt hoặc nội dung chính

    // Cascade ALL to save ChiTietBaiViet automatically
    @OneToOne(mappedBy = "baiViet", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private ChiTietBaiViet chiTietBaiViet;
}
