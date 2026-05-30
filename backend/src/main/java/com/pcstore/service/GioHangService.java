package com.pcstore.service;

import com.pcstore.entity.GioHang;

import java.util.List;

public interface GioHangService {
    List<GioHang> getAll();
    GioHang getById(Long id);
    void delete(Long id);
}
