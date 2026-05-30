package com.pcstore.service.impl;

import com.pcstore.dto.request.BaiVietRequest;
import com.pcstore.entity.BaiViet;
import com.pcstore.entity.ChiTietBaiViet;
import com.pcstore.exception.ResourceNotFoundException;
import com.pcstore.repository.BaiVietRepository;
import com.pcstore.service.BaiVietService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BaiVietServiceImpl implements BaiVietService {

    private final BaiVietRepository baiVietRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BaiViet> getAll() {
        List<BaiViet> list = baiVietRepository.findAllByOrderByMaBaiVietDesc();
        // pre-fetch details
        list.forEach(bv -> {
            if (bv.getChiTietBaiViet() != null) {
                bv.getChiTietBaiViet().getNoiDung();
            }
        });
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public BaiViet getById(Long id) {
        BaiViet bv = baiVietRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết ID: " + id));
        if (bv.getChiTietBaiViet() != null) bv.getChiTietBaiViet().getNoiDung();
        return bv;
    }

    @Override
    @Transactional
    public BaiViet create(BaiVietRequest request) {
        BaiViet bv = BaiViet.builder()
                .tieuDe(request.getTieuDe())
                .nguoiViet(request.getNguoiViet())
                .noiDung(request.getNoiDung()) // optional preview
                .build();

        ChiTietBaiViet chiTiet = ChiTietBaiViet.builder()
                .baiViet(bv)
                .noiDung(request.getNoiDung())
                .hinhAnh(request.getHinhAnh())
                .build();

        bv.setChiTietBaiViet(chiTiet);
        return baiVietRepository.save(bv);
    }

    @Override
    @Transactional
    public BaiViet update(Long id, BaiVietRequest request) {
        BaiViet existing = getById(id);
        existing.setTieuDe(request.getTieuDe());
        existing.setNguoiViet(request.getNguoiViet());
        existing.setNoiDung(request.getNoiDung());

        if (existing.getChiTietBaiViet() != null) {
            existing.getChiTietBaiViet().setNoiDung(request.getNoiDung());
            existing.getChiTietBaiViet().setHinhAnh(request.getHinhAnh());
        } else {
            ChiTietBaiViet chiTiet = ChiTietBaiViet.builder()
                    .baiViet(existing)
                    .noiDung(request.getNoiDung())
                    .hinhAnh(request.getHinhAnh())
                    .build();
            existing.setChiTietBaiViet(chiTiet);
        }

        return baiVietRepository.save(existing);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        getById(id);
        baiVietRepository.deleteById(id);
    }
}
