package com.pcstore.dto.request;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManualOrderRequest {
    private String tenNguoiNhan;
    private String sdtNguoiNhan;
    private String diaChiChiTiet;
    private Long maXa;
    private Long khachHangId; // Có thể null nếu khách vãng lai
    private BigDecimal phiVanChuyen;
    private String ghiChu;
    private String hinhThucThanhToan;
    private List<CartItemRequest> items;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemRequest {
        private Long productId;
        private Integer quantity;
        private BigDecimal price;
    }
}
