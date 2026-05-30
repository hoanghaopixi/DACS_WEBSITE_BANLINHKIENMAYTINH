package com.pcstore.service.impl;

import com.pcstore.entity.ThuongHieu;
import com.pcstore.exception.ResourceNotFoundException;
import com.pcstore.repository.ThuongHieuRepository;
import com.pcstore.service.ThuongHieuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ThuongHieuServiceImpl implements ThuongHieuService {

    private final ThuongHieuRepository thuongHieuRepository;

    @Override
    public List<ThuongHieu> getAll() {
        return thuongHieuRepository.findAll();
    }

    @Override
    public ThuongHieu getById(Long id) {
        return thuongHieuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thương hiệu với ID: " + id));
    }

    @Override
    public ThuongHieu create(ThuongHieu thuongHieu) {
        return thuongHieuRepository.save(thuongHieu);
    }

    @Override
    public ThuongHieu update(Long id, ThuongHieu details) {
        ThuongHieu thuongHieu = getById(id);
        thuongHieu.setTenThuongHieu(details.getTenThuongHieu());
        thuongHieu.setQuocGia(details.getQuocGia());
        thuongHieu.setWebsite(details.getWebsite());
        thuongHieu.setLogo(details.getLogo());
        return thuongHieuRepository.save(thuongHieu);
    }

    @Override
    public void delete(Long id) {
        ThuongHieu thuongHieu = getById(id);
        thuongHieuRepository.delete(thuongHieu);
    }
}
