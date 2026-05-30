package com.pcstore.service;

import com.pcstore.entity.KhachHang;
import java.util.List;

public interface KhachHangService {
    List<KhachHang> getAll();
    KhachHang getById(Long id);
    KhachHang create(KhachHang khachHang);
    KhachHang update(Long id, KhachHang khachHang);
    void delete(Long id);
}
