package com.pcstore.service.impl;

import com.pcstore.entity.HoaDon;
import com.pcstore.exception.ResourceNotFoundException;
import com.pcstore.repository.DonHangRepository;
import com.pcstore.repository.HoaDonRepository;
import com.pcstore.service.HoaDonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HoaDonServiceImpl implements HoaDonService {

    private final HoaDonRepository hoaDonRepository;
    private final DonHangRepository donHangRepository;

    @Override
    @Transactional(readOnly = true)
    public List<HoaDon> getAll() {
        List<HoaDon> list = hoaDonRepository.findAllByOrderByMaHoaDonDesc();
        list.forEach(hd -> {
            if (hd.getDonHang() != null) {
                hd.getDonHang().getMaDonHang();
                if (hd.getDonHang().getKhachHang() != null) {
                    hd.getDonHang().getKhachHang().getHoTen();
                }
            }
            if (hd.getNhanVien() != null) {
                hd.getNhanVien().getHoTen();
            }
        });
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public HoaDon getById(Long id) {
        HoaDon hd = hoaDonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn ID: " + id));
        if (hd.getDonHang() != null) {
            hd.getDonHang().getMaDonHang();
            if (hd.getDonHang().getKhachHang() != null) {
                hd.getDonHang().getKhachHang().getHoTen();
            }
        }
        if (hd.getNhanVien() != null) {
            hd.getNhanVien().getHoTen();
        }
        return hd;
    }

    @Override
    @Transactional
    public HoaDon update(Long id, HoaDon hoaDon) {
        HoaDon existing = getById(id);
        String oldStatus = existing.getTrangThaiThanhToan();
        
        existing.setTrangThaiThanhToan(hoaDon.getTrangThaiThanhToan());
        existing.setHinhThucThanhToan(hoaDon.getHinhThucThanhToan());
        if ("Đã thanh toán".equals(hoaDon.getTrangThaiThanhToan()) && existing.getThoiDiemThanhToan() == null) {
            existing.setThoiDiemThanhToan(java.time.LocalDateTime.now());
        }
        
        // Đồng bộ: Hóa đơn đã thanh toán → Đơn hàng hoàn thành
        if ("Đã thanh toán".equals(hoaDon.getTrangThaiThanhToan()) && !"Đã thanh toán".equals(oldStatus)) {
            if (existing.getDonHang() != null) {
                com.pcstore.entity.DonHang donHang = existing.getDonHang();
                if (!"Hoàn thành".equals(donHang.getTrangThai())) {
                    donHang.setTrangThai("Hoàn thành");
                    donHangRepository.save(donHang);
                }
            }
        }

        // Đồng bộ: Hóa đơn bị hủy → Đơn hàng tương ứng cũng phải hủy
        if ("Đã hủy".equals(hoaDon.getTrangThaiThanhToan()) && !"Đã hủy".equals(oldStatus)) {
            if (existing.getDonHang() != null) {
                com.pcstore.entity.DonHang donHang = existing.getDonHang();
                if (!"Đã hủy".equals(donHang.getTrangThai())) {
                    donHang.setTrangThai("Đã hủy");
                    donHangRepository.save(donHang);
                }
            }
        }
        
        return hoaDonRepository.save(existing);
    }
}

