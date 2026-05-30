package com.pcstore.service;

import com.pcstore.dto.request.PhieuNhapRequest;
import com.pcstore.entity.ChiTietPhieuNhap;
import com.pcstore.entity.PhieuNhap;

import java.util.List;

public interface PhieuNhapService {
    List<PhieuNhap> getAll();
    PhieuNhap getById(Long id);
    List<ChiTietPhieuNhap> getChiTietByPhieuNhap(Long maPhieuNhap);
    PhieuNhap create(PhieuNhapRequest request);
}
