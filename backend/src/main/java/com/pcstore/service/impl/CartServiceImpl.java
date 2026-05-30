package com.pcstore.service.impl;

import com.pcstore.dto.request.CartItemRequest;
import com.pcstore.dto.response.CartItemResponse;
import com.pcstore.dto.response.CartResponse;
import com.pcstore.entity.ChiTietGioHang;
import com.pcstore.entity.GioHang;
import com.pcstore.entity.KhachHang;
import com.pcstore.entity.SanPham;
import com.pcstore.exception.ResourceNotFoundException;
import com.pcstore.repository.ChiTietGioHangRepository;
import com.pcstore.repository.GioHangRepository;
import com.pcstore.repository.KhachHangRepository;
import com.pcstore.repository.SanPhamRepository;
import com.pcstore.service.CartService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private static final String CART_SESSION_KEY = "PC_STORE_CART";

    private final SanPhamRepository sanPhamRepository;
    private final GioHangRepository gioHangRepository;
    private final ChiTietGioHangRepository chiTietGioHangRepository;
    private final KhachHangRepository khachHangRepository;

    // ========== DATABASE-BACKED METHODS ==========

    private GioHang getOrCreateGioHang(Long maKH) {
        return gioHangRepository.findByKhachHang_MaKH(maKH).orElseGet(() -> {
            KhachHang kh = khachHangRepository.findById(maKH)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng ID: " + maKH));
            GioHang gh = GioHang.builder().khachHang(kh).build();
            return gioHangRepository.save(gh);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCartByCustomer(Long maKH) {
        Optional<GioHang> optGh = gioHangRepository.findByKhachHang_MaKH(maKH);
        if (optGh.isEmpty()) {
            return CartResponse.builder().items(new ArrayList<>()).totalQuantity(0).totalAmount(BigDecimal.ZERO).build();
        }
        GioHang gh = optGh.get();
        List<ChiTietGioHang> chiTiets = chiTietGioHangRepository.findByGioHang_MaGioHang(gh.getMaGioHang());
        return buildCartResponseFromDb(chiTiets);
    }

    @Override
    @Transactional
    public CartResponse addItemByCustomer(Long maKH, CartItemRequest request) {
        GioHang gh = getOrCreateGioHang(maKH);
        SanPham sp = sanPhamRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại: " + request.getProductId()));

        Optional<ChiTietGioHang> existing = chiTietGioHangRepository
                .findByGioHang_MaGioHangAndSanPham_MaSP(gh.getMaGioHang(), request.getProductId());

        if (existing.isPresent()) {
            ChiTietGioHang ct = existing.get();
            int newQty = ct.getSoLuong() + request.getQuantity();
            if (sp.getSoLuongTon() != null) newQty = Math.min(newQty, sp.getSoLuongTon());
            ct.setSoLuong(Math.max(1, newQty));
            ct.setDonGia(calculateDiscountedPrice(sp));
            chiTietGioHangRepository.save(ct);
        } else {
            int qty = request.getQuantity();
            if (sp.getSoLuongTon() != null) qty = Math.min(qty, sp.getSoLuongTon());
            ChiTietGioHang ct = ChiTietGioHang.builder()
                    .gioHang(gh).sanPham(sp).soLuong(Math.max(1, qty))
                    .donGia(calculateDiscountedPrice(sp)).build();
            chiTietGioHangRepository.save(ct);
        }

        return getCartByCustomer(maKH);
    }

    @Override
    @Transactional
    public CartResponse updateItemByCustomer(Long maKH, CartItemRequest request) {
        GioHang gh = getOrCreateGioHang(maKH);
        ChiTietGioHang ct = chiTietGioHangRepository
                .findByGioHang_MaGioHangAndSanPham_MaSP(gh.getMaGioHang(), request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm chưa có trong giỏ hàng."));

        SanPham sp = ct.getSanPham();
        int qty = request.getQuantity();
        if (sp.getSoLuongTon() != null) qty = Math.min(qty, sp.getSoLuongTon());
        ct.setSoLuong(Math.max(1, qty));
        ct.setDonGia(calculateDiscountedPrice(sp));
        chiTietGioHangRepository.save(ct);

        return getCartByCustomer(maKH);
    }

    @Override
    @Transactional
    public CartResponse removeItemByCustomer(Long maKH, Long productId) {
        GioHang gh = getOrCreateGioHang(maKH);
        chiTietGioHangRepository.deleteByGioHang_MaGioHangAndSanPham_MaSP(gh.getMaGioHang(), productId);
        return getCartByCustomer(maKH);
    }

    @Override
    @Transactional
    public CartResponse clearCartByCustomer(Long maKH) {
        Optional<GioHang> optGh = gioHangRepository.findByKhachHang_MaKH(maKH);
        if (optGh.isPresent()) {
            chiTietGioHangRepository.deleteByGioHang_MaGioHang(optGh.get().getMaGioHang());
        }
        return CartResponse.builder().items(new ArrayList<>()).totalQuantity(0).totalAmount(BigDecimal.ZERO).build();
    }

    private CartResponse buildCartResponseFromDb(List<ChiTietGioHang> chiTiets) {
        if (chiTiets.isEmpty()) {
            return CartResponse.builder().items(new ArrayList<>()).totalQuantity(0).totalAmount(BigDecimal.ZERO).build();
        }

        List<CartItemResponse> items = chiTiets.stream().map(ct -> {
            SanPham sp = ct.getSanPham();
            BigDecimal actualPrice = calculateDiscountedPrice(sp);
            BigDecimal subtotal = actualPrice.multiply(BigDecimal.valueOf(ct.getSoLuong()));
            return CartItemResponse.builder()
                    .productId(sp.getMaSP())
                    .name(sp.getTenSP())
                    .image(sp.getHinhAnh())
                    .category(sp.getDanhMuc() != null ? sp.getDanhMuc().getTenDanhMuc() : "Khác")
                    .price(actualPrice)
                    .stock(sp.getSoLuongTon())
                    .quantity(ct.getSoLuong())
                    .subtotal(subtotal)
                    .build();
        }).toList();

        int totalQuantity = items.stream().mapToInt(CartItemResponse::getQuantity).sum();
        BigDecimal totalAmount = items.stream().map(CartItemResponse::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder().items(items).totalQuantity(totalQuantity).totalAmount(totalAmount).build();
    }

    // ========== SESSION-BASED METHODS (GUEST FALLBACK) ==========

    @Override
    public CartResponse getCart(HttpSession session) {
        return buildCartResponse(getCartMap(session));
    }

    @Override
    public CartResponse addItem(HttpSession session, CartItemRequest request) {
        Map<Long, Integer> cart = getCartMap(session);
        SanPham sanPham = sanPhamRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + request.getProductId()));
        int currentQuantity = cart.getOrDefault(request.getProductId(), 0);
        int nextQuantity = Math.min(currentQuantity + request.getQuantity(), sanPham.getSoLuongTon() == null ? Integer.MAX_VALUE : sanPham.getSoLuongTon());
        cart.put(request.getProductId(), Math.max(nextQuantity, 1));
        session.setAttribute(CART_SESSION_KEY, cart);
        return buildCartResponse(cart);
    }

    @Override
    public CartResponse updateItem(HttpSession session, CartItemRequest request) {
        Map<Long, Integer> cart = getCartMap(session);
        if (!cart.containsKey(request.getProductId())) {
            throw new ResourceNotFoundException("Sản phẩm chưa có trong giỏ hàng");
        }
        SanPham sanPham = sanPhamRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + request.getProductId()));
        int quantity = Math.min(request.getQuantity(), sanPham.getSoLuongTon() == null ? Integer.MAX_VALUE : sanPham.getSoLuongTon());
        cart.put(request.getProductId(), Math.max(quantity, 1));
        session.setAttribute(CART_SESSION_KEY, cart);
        return buildCartResponse(cart);
    }

    @Override
    public CartResponse removeItem(HttpSession session, Long productId) {
        Map<Long, Integer> cart = getCartMap(session);
        cart.remove(productId);
        session.setAttribute(CART_SESSION_KEY, cart);
        return buildCartResponse(cart);
    }

    @Override
    public CartResponse clearCart(HttpSession session) {
        Map<Long, Integer> cart = new LinkedHashMap<>();
        session.setAttribute(CART_SESSION_KEY, cart);
        return buildCartResponse(cart);
    }

    @SuppressWarnings("unchecked")
    private Map<Long, Integer> getCartMap(HttpSession session) {
        Object cartObject = session.getAttribute(CART_SESSION_KEY);
        if (cartObject instanceof Map<?, ?> map) {
            return (Map<Long, Integer>) map;
        }
        Map<Long, Integer> emptyCart = new LinkedHashMap<>();
        session.setAttribute(CART_SESSION_KEY, emptyCart);
        return emptyCart;
    }

    private CartResponse buildCartResponse(Map<Long, Integer> cart) {
        if (cart.isEmpty()) {
            return CartResponse.builder().items(new ArrayList<>()).totalQuantity(0).totalAmount(BigDecimal.ZERO).build();
        }
        List<SanPham> sanPhams = sanPhamRepository.findByMaSPIn(new ArrayList<>(cart.keySet()));
        Map<Long, SanPham> productMap = sanPhams.stream().collect(Collectors.toMap(SanPham::getMaSP, p -> p));
        List<CartItemResponse> items = cart.entrySet().stream()
                .filter(entry -> productMap.containsKey(entry.getKey()))
                .map(entry -> {
                    SanPham product = productMap.get(entry.getKey());
                    BigDecimal actualPrice = calculateDiscountedPrice(product);
                    BigDecimal subtotal = actualPrice.multiply(BigDecimal.valueOf(entry.getValue()));
                    return CartItemResponse.builder()
                            .productId(product.getMaSP()).name(product.getTenSP()).image(product.getHinhAnh())
                            .category(product.getDanhMuc() != null ? product.getDanhMuc().getTenDanhMuc() : "Khác")
                            .price(actualPrice).stock(product.getSoLuongTon())
                            .quantity(entry.getValue()).subtotal(subtotal).build();
                }).toList();
        int totalQuantity = items.stream().mapToInt(CartItemResponse::getQuantity).sum();
        BigDecimal totalAmount = items.stream().map(CartItemResponse::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        return CartResponse.builder().items(items).totalQuantity(totalQuantity).totalAmount(totalAmount).build();
    }

    private BigDecimal calculateDiscountedPrice(SanPham sp) {
        if (sp.getGiaKM() != null && sp.getGiaKM().compareTo(BigDecimal.ZERO) > 0) {
            return sp.getGiaKM();
        }
        return sp.getGiaBan();
    }
}
