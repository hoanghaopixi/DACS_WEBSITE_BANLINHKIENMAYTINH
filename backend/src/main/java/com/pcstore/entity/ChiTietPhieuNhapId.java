package com.pcstore.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietPhieuNhapId implements Serializable {
    private Long phieuNhap;
    private Long sanPham;
}
