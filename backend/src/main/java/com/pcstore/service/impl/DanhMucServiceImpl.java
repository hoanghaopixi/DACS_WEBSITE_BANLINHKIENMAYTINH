package com.pcstore.service.impl;

import com.pcstore.entity.DanhMuc;
import com.pcstore.exception.ResourceNotFoundException;
import com.pcstore.repository.DanhMucRepository;
import com.pcstore.repository.SanPhamRepository;
import com.pcstore.service.DanhMucService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DanhMucServiceImpl implements DanhMucService {

    private final DanhMucRepository danhMucRepository;
    private final SanPhamRepository sanPhamRepository;

    @Override
    public List<DanhMuc> getAll() {
        return danhMucRepository.findAll();
    }

    @Override
    public DanhMuc getById(Long id) {
        return danhMucRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id));
    }

    @Override
    public DanhMuc create(DanhMuc danhMuc) {
        return danhMucRepository.save(danhMuc);
    }

    @Override
    public DanhMuc update(Long id, DanhMuc danhMucDetails) {
        DanhMuc danhMuc = getById(id);
        danhMuc.setTenDanhMuc(danhMucDetails.getTenDanhMuc());
        danhMuc.setMoTa(danhMucDetails.getMoTa());
        return danhMucRepository.save(danhMuc);
    }

    @Override
    public void delete(Long id) {
        DanhMuc danhMuc = getById(id);
        long productCount = sanPhamRepository.countByDanhMuc_MaDanhMuc(id);
        if (productCount > 0) {
            throw new IllegalArgumentException("Không thể xóa danh mục \"" + danhMuc.getTenDanhMuc() 
                + "\" vì vẫn còn " + productCount + " sản phẩm thuộc danh mục này. Vui lòng chuyển hoặc xóa các sản phẩm trước.");
        }
        danhMucRepository.delete(danhMuc);
    }
}
