package com.pcstore.service.impl;

import com.pcstore.entity.DanhMuc;
import com.pcstore.entity.SanPham;
import com.pcstore.entity.ThuongHieu;
import com.pcstore.exception.ResourceNotFoundException;
import com.pcstore.repository.DanhMucRepository;
import com.pcstore.repository.SanPhamRepository;
import com.pcstore.repository.ThuongHieuRepository;
import com.pcstore.service.SanPhamService;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SanPhamServiceImpl implements SanPhamService {

    private final SanPhamRepository sanPhamRepository;
    private final DanhMucRepository danhMucRepository;
    private final ThuongHieuRepository thuongHieuRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SanPham> getAll() {
        List<SanPham> list = sanPhamRepository.findAll();
        list.forEach(sp -> {
            if (sp.getHinhAnhSanPhams() != null) sp.getHinhAnhSanPhams().size();
            if (sp.getDanhGias() != null) sp.getDanhGias().size();
        });
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SanPham> search(String keyword) {
        String normalizedKeyword = keyword == null ? "" : keyword.trim();
        if (normalizedKeyword.isEmpty()) {
            return sanPhamRepository.findAll();
        }
        List<SanPham> list = sanPhamRepository.searchByKeyword(normalizedKeyword);
        list.forEach(sp -> {
            if (sp.getHinhAnhSanPhams() != null) sp.getHinhAnhSanPhams().size();
            if (sp.getDanhGias() != null) sp.getDanhGias().size();
        });
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SanPham> getSuggestions(int limit) {
        List<SanPham> suggestions = sanPhamRepository.findTop8ByOrderByMaSPDesc()
                .stream().limit(Math.max(limit, 1)).toList();
        suggestions.forEach(sp -> {
            if (sp.getHinhAnhSanPhams() != null) sp.getHinhAnhSanPhams().size();
            if (sp.getDanhGias() != null) sp.getDanhGias().size();
        });
        return suggestions;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SanPham> getByCategoryKeyword(String keyword) {
        String normalizedKeyword = keyword == null ? "" : keyword.trim();
        if (normalizedKeyword.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        List<SanPham> list = sanPhamRepository.findByDanhMuc_TenDanhMucContainingIgnoreCase(normalizedKeyword);
        list.forEach(sp -> {
            if (sp.getHinhAnhSanPhams() != null) sp.getHinhAnhSanPhams().size();
            if (sp.getDanhGias() != null) sp.getDanhGias().size();
        });
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public SanPham getById(@NonNull Long id) {
        SanPham sp = sanPhamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));
        if (sp.getHinhAnhSanPhams() != null) sp.getHinhAnhSanPhams().size();
        if (sp.getDanhGias() != null) sp.getDanhGias().size();
        return sp;
    }

    @Override
    public SanPham create(@NonNull SanPham sanPham) {
        if (sanPham.getDanhMuc() == null || sanPham.getDanhMuc().getMaDanhMuc() == null) {
            throw new IllegalArgumentException("Danh mục không được để trống");
        }
        if (sanPham.getThuongHieu() == null || sanPham.getThuongHieu().getMaThuongHieu() == null) {
            throw new IllegalArgumentException("Thương hiệu không được để trống");
        }
        DanhMuc danhMuc = danhMucRepository.findById(sanPham.getDanhMuc().getMaDanhMuc())
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại"));
        ThuongHieu thuongHieu = thuongHieuRepository.findById(sanPham.getThuongHieu().getMaThuongHieu())
                .orElseThrow(() -> new ResourceNotFoundException("Thương hiệu không tồn tại"));
        
        sanPham.setDanhMuc(danhMuc);
        sanPham.setThuongHieu(thuongHieu);
        // Note: giaKM is automatically mapped from the request.

        if (sanPham.getHinhAnhSanPhams() != null) {
            for (com.pcstore.entity.HinhAnhSanPham img : sanPham.getHinhAnhSanPhams()) {
                img.setSanPham(sanPham);
            }
        }

        return sanPhamRepository.save(sanPham);
    }

    @Override
    public SanPham update(@NonNull Long id, @NonNull SanPham details) {
        SanPham sanPham = getById(id);
        
        if (details.getDanhMuc() != null && details.getDanhMuc().getMaDanhMuc() != null) {
             DanhMuc danhMuc = danhMucRepository.findById(details.getDanhMuc().getMaDanhMuc())
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại"));
             sanPham.setDanhMuc(danhMuc);
        }
        if (details.getThuongHieu() != null && details.getThuongHieu().getMaThuongHieu() != null) {
            ThuongHieu thuongHieu = thuongHieuRepository.findById(details.getThuongHieu().getMaThuongHieu())
                .orElseThrow(() -> new ResourceNotFoundException("Thương hiệu không tồn tại"));
            sanPham.setThuongHieu(thuongHieu);
        }

        sanPham.setTenSP(details.getTenSP());
        sanPham.setGiaNhap(details.getGiaNhap());
        sanPham.setGiaBan(details.getGiaBan());
        sanPham.setGiaKM(details.getGiaKM());
        sanPham.setSoLuongTon(details.getSoLuongTon());
        sanPham.setTonToiThieu(details.getTonToiThieu());
        sanPham.setMoTa(details.getMoTa());
        sanPham.setBaoHanh(details.getBaoHanh());
        sanPham.setHinhAnh(details.getHinhAnh());

        if (details.getHinhAnhSanPhams() != null) {
            if (sanPham.getHinhAnhSanPhams() != null) {
                sanPham.getHinhAnhSanPhams().clear();
            } else {
                sanPham.setHinhAnhSanPhams(new java.util.ArrayList<>());
            }
            for (com.pcstore.entity.HinhAnhSanPham img : details.getHinhAnhSanPhams()) {
                img.setSanPham(sanPham);
                sanPham.getHinhAnhSanPhams().add(img);
            }
        }

        return sanPhamRepository.save(sanPham);
    }

    @Override
    public void delete(Long id) {
        SanPham sanPham = getById(id);
        sanPhamRepository.delete(sanPham);
    }
}
