package com.pcstore.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
public class CartResponse {
    private List<CartItemResponse> items;
    private int totalQuantity;
    private BigDecimal totalAmount;
}
