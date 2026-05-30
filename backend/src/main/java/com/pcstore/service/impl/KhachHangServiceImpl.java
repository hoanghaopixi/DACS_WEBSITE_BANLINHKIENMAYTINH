package com.pcstore.service.impl;

import com.pcstore.entity.KhachHang;
import com.pcstore.exception.ResourceNotFoundException;
import com.pcstore.repository.KhachHangRepository;
import com.pcstore.service.KhachHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class KhachHangServiceImpl implements KhachHangService {

    private final KhachHangRepository khachHangRepository;

    @Override
    public List<KhachHang> getAll() {
        return khachHangRepository.findAll();
    }

    @Override
    public KhachHang getById(Long id) {
        return khachHangRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với ID: " + id));
    }

    @Override
    public KhachHang create(KhachHang khachHang) {
        return khachHangRepository.save(khachHang);
    }

    @Override
    public KhachHang update(Long id, KhachHang details) {
        KhachHang khachHang = getById(id);
        khachHang.setHoTen(details.getHoTen());
        khachHang.setSdt(details.getSdt());
        khachHang.setEmail(details.getEmail());
        khachHang.setDiaChi(details.getDiaChi());
        khachHang.setNgaySinh(details.getNgaySinh());
        khachHang.setGioiTinh(details.getGioiTinh());
        return khachHangRepository.save(khachHang);
    }

    @Override
    public void delete(Long id) {
        KhachHang khachHang = getById(id);
        khachHangRepository.delete(khachHang);
    }
}
