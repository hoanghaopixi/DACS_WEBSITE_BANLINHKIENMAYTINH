package com.pcstore.service;

import com.pcstore.entity.HoaDon;

import java.util.List;

public interface HoaDonService {
    List<HoaDon> getAll();
    HoaDon getById(Long id);
    HoaDon update(Long id, HoaDon hoaDon);
}
