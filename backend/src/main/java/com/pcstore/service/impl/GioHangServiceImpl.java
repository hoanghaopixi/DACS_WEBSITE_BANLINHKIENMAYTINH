package com.pcstore.service.impl;

import com.pcstore.entity.GioHang;
import com.pcstore.exception.ResourceNotFoundException;
import com.pcstore.repository.GioHangRepository;
import com.pcstore.service.GioHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GioHangServiceImpl implements GioHangService {

    private final GioHangRepository gioHangRepository;

    @Override
    @Transactional(readOnly = true)
    public List<GioHang> getAll() {
        List<GioHang> list = gioHangRepository.findAllByOrderByMaGioHangDesc();
        list.forEach(gh -> {
            if (gh.getKhachHang() != null) gh.getKhachHang().getHoTen();
            if (gh.getChiTietGioHangs() != null) {
                gh.getChiTietGioHangs().forEach(ct -> {
                    if (ct.getSanPham() != null) ct.getSanPham().getTenSP();
                });
            }
        });
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public GioHang getById(Long id) {
        GioHang gh = gioHangRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giỏ hàng ID: " + id));
        if (gh.getKhachHang() != null) gh.getKhachHang().getHoTen();
        if (gh.getChiTietGioHangs() != null) {
            gh.getChiTietGioHangs().forEach(ct -> {
                if (ct.getSanPham() != null) ct.getSanPham().getTenSP();
            });
        }
        return gh;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        getById(id);
        gioHangRepository.deleteById(id);
    }
}
