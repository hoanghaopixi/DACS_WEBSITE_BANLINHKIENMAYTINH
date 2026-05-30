package com.pcstore.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemRequest {
    @NotNull(message = "Mã sản phẩm không được để trống")
    private Long productId;

    @Min(value = 1, message = "Số lượng tối thiểu là 1")
    private int quantity = 1;
}
