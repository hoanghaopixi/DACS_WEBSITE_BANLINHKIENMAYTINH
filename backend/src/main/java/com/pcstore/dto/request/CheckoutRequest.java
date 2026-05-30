package com.pcstore.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CheckoutRequest {
    private Long khachHangId;
    private Long maXa;
    private String diaChiChiTiet;
    private String tenNguoiNhan;
    private String sdtNguoiNhan;
    private BigDecimal phiVanChuyen;
    private String ghiChu;
    private String hinhThucThanhToan;
    private BigDecimal tongTien;
    private Long maKM;           // Coupon ID (nullable)
    private BigDecimal soTienGiam; // Calculated discount amount
    private List<CartItemRequest> items;


    @Data
    public static class CartItemRequest {
        private Long productId;
        private Integer quantity;
        private BigDecimal price;
    }
}
