package com.pcstore.controller;

import com.pcstore.dto.request.CartItemRequest;
import com.pcstore.dto.response.ApiResponse;
import com.pcstore.dto.response.CartResponse;
import com.pcstore.service.CartService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin("*")
public class CartController {
    private final CartService cartService;

    // ===== Database-backed cart (by customer ID) =====

    @GetMapping("/khach-hang/{maKH}")
    public ResponseEntity<ApiResponse<CartResponse>> getCartByCustomer(@PathVariable Long maKH) {
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Thành công")
                .data(cartService.getCartByCustomer(maKH))
                .build());
    }

    @PostMapping("/khach-hang/{maKH}/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItemByCustomer(
            @PathVariable Long maKH,
            @Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Đã thêm sản phẩm vào giỏ hàng")
                .data(cartService.addItemByCustomer(maKH, request))
                .build());
    }

    @PutMapping("/khach-hang/{maKH}/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateItemByCustomer(
            @PathVariable Long maKH,
            @PathVariable Long productId,
            @Valid @RequestBody CartItemRequest request) {
        request.setProductId(productId);
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Đã cập nhật giỏ hàng")
                .data(cartService.updateItemByCustomer(maKH, request))
                .build());
    }

    @DeleteMapping("/khach-hang/{maKH}/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItemByCustomer(
            @PathVariable Long maKH,
            @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Đã xóa sản phẩm khỏi giỏ hàng")
                .data(cartService.removeItemByCustomer(maKH, productId))
                .build());
    }

    @DeleteMapping("/khach-hang/{maKH}")
    public ResponseEntity<ApiResponse<CartResponse>> clearCartByCustomer(@PathVariable Long maKH) {
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Đã xóa toàn bộ giỏ hàng")
                .data(cartService.clearCartByCustomer(maKH))
                .build());
    }

    // ===== Session-based fallback (for guests) =====

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(HttpSession session) {
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Thành công")
                .data(cartService.getCart(session))
                .build());
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(@Valid @RequestBody CartItemRequest request, HttpSession session) {
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Đã thêm sản phẩm vào giỏ hàng")
                .data(cartService.addItem(session, request))
                .build());
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(
            @PathVariable Long productId,
            @Valid @RequestBody CartItemRequest request,
            HttpSession session) {
        request.setProductId(productId);
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Đã cập nhật giỏ hàng")
                .data(cartService.updateItem(session, request))
                .build());
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(@PathVariable Long productId, HttpSession session) {
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Đã xóa sản phẩm khỏi giỏ hàng")
                .data(cartService.removeItem(session, productId))
                .build());
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<CartResponse>> clearCart(HttpSession session) {
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Đã xóa toàn bộ giỏ hàng")
                .data(cartService.clearCart(session))
                .build());
    }
}
