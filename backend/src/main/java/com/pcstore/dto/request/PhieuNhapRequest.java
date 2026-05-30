package com.pcstore.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class PhieuNhapRequest {
    private Long maNCC;
    private BigDecimal tongTien;
    private List<ItemRequest> items;

    @Data
    public static class ItemRequest {
        private Long maSP;
        private Integer soLuong;
        private BigDecimal donGia;
    }
}
