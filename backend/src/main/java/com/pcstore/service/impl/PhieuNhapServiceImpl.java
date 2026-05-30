package com.pcstore.service.impl;

import com.pcstore.dto.request.PhieuNhapRequest;
import com.pcstore.entity.ChiTietPhieuNhap;
import com.pcstore.entity.NhaCungCap;
import com.pcstore.entity.PhieuNhap;
import com.pcstore.entity.SanPham;
import com.pcstore.exception.ResourceNotFoundException;
import com.pcstore.repository.ChiTietPhieuNhapRepository;
import com.pcstore.repository.NhaCungCapRepository;
import com.pcstore.repository.PhieuNhapRepository;
import com.pcstore.repository.SanPhamRepository;
import com.pcstore.service.PhieuNhapService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PhieuNhapServiceImpl implements PhieuNhapService {

    private final PhieuNhapRepository phieuNhapRepository;
    private final ChiTietPhieuNhapRepository chiTietPhieuNhapRepository;
    private final NhaCungCapRepository nhaCungCapRepository;
    private final SanPhamRepository sanPhamRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PhieuNhap> getAll() {
        List<PhieuNhap> phieuNhaps = phieuNhapRepository.findAllByOrderByMaPhieuNhapDesc();
        // Force init lazy proxies to prevent serialization errors
        phieuNhaps.forEach(pn -> {
            if (pn.getNhaCungCap() != null) {
                pn.getNhaCungCap().getTenNCC();
            }
        });
        return phieuNhaps;
    }

    @Override
    @Transactional(readOnly = true)
    public PhieuNhap getById(Long id) {
        PhieuNhap pn = phieuNhapRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Phiếu Nhập ID: " + id));
        if (pn.getNhaCungCap() != null) pn.getNhaCungCap().getTenNCC();
        return pn;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChiTietPhieuNhap> getChiTietByPhieuNhap(Long maPhieuNhap) {
        List<ChiTietPhieuNhap> chiTiets = chiTietPhieuNhapRepository.findByPhieuNhap_MaPhieuNhap(maPhieuNhap);
        chiTiets.forEach(ct -> {
            if (ct.getSanPham() != null) {
                ct.getSanPham().getTenSP(); // init lazy
            }
        });
        return chiTiets;
    }

    @Override
    @Transactional
    public PhieuNhap create(PhieuNhapRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Phiếu nhập phải có ít nhất 1 sản phẩm.");
        }

        NhaCungCap ncc = nhaCungCapRepository.findById(request.getMaNCC())
                .orElseThrow(() -> new ResourceNotFoundException("Nhà cung cấp không tồn tại"));

        // 1. Create PhieuNhap
        PhieuNhap phieuNhap = PhieuNhap.builder()
                .nhaCungCap(ncc)
                .tongTien(request.getTongTien())
                .build();
        PhieuNhap savedPn = phieuNhapRepository.save(phieuNhap);

        // 2. Create ChiTietPhieuNhap & Update SanPham Inventory + Price
        for (PhieuNhapRequest.ItemRequest item : request.getItems()) {
            SanPham sp = sanPhamRepository.findById(item.getMaSP())
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm ID " + item.getMaSP() + " không tồn tại"));

            // Save details
            ChiTietPhieuNhap chiTiet = ChiTietPhieuNhap.builder()
                    .phieuNhap(savedPn)
                    .sanPham(sp)
                    .soLuong(item.getSoLuong())
                    .donGia(item.getDonGia())
                    .build();
            chiTietPhieuNhapRepository.save(chiTiet);

            // Update SanPham
            sp.setSoLuongTon(sp.getSoLuongTon() + item.getSoLuong());
            sp.setGiaNhap(item.getDonGia());
            sanPhamRepository.save(sp);
        }

        return savedPn;
    }
}
