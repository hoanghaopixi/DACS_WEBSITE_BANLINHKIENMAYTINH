package com.pcstore.service;

import com.pcstore.entity.DonHang;
import java.util.List;

public interface DonHangService {
    List<DonHang> getAll();
    DonHang getById(Long id);
    List<DonHang> getByKhachHangId(Long maKH);
    DonHang create(DonHang donHang);
    DonHang checkout(com.pcstore.dto.request.CheckoutRequest request);
    DonHang createManualOrder(com.pcstore.dto.request.ManualOrderRequest request);
    DonHang update(Long id, DonHang donHang);
    void delete(Long id);
}
