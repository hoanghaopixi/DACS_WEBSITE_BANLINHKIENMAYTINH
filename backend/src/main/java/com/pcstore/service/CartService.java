package com.pcstore.service;

import com.pcstore.dto.request.CartItemRequest;
import com.pcstore.dto.response.CartResponse;
import jakarta.servlet.http.HttpSession;

public interface CartService {
    // Session-based (guest fallback)
    CartResponse getCart(HttpSession session);
    CartResponse addItem(HttpSession session, CartItemRequest request);
    CartResponse updateItem(HttpSession session, CartItemRequest request);
    CartResponse removeItem(HttpSession session, Long productId);
    CartResponse clearCart(HttpSession session);

    // Database-based (logged-in customers)
    CartResponse getCartByCustomer(Long maKH);
    CartResponse addItemByCustomer(Long maKH, CartItemRequest request);
    CartResponse updateItemByCustomer(Long maKH, CartItemRequest request);
    CartResponse removeItemByCustomer(Long maKH, Long productId);
    CartResponse clearCartByCustomer(Long maKH);
}

