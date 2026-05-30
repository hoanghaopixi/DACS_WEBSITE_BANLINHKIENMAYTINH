package com.pcstore.service.impl;

import com.pcstore.entity.NhaCungCap;
import com.pcstore.exception.ResourceNotFoundException;
import com.pcstore.repository.NhaCungCapRepository;
import com.pcstore.service.NhaCungCapService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NhaCungCapServiceImpl implements NhaCungCapService {

    private final NhaCungCapRepository nhaCungCapRepository;

    @Override
    public List<NhaCungCap> getAll() {
        return nhaCungCapRepository.findAll();
    }

    @Override
    public NhaCungCap getById(Long id) {
        return nhaCungCapRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhà cung cấp với ID: " + id));
    }

    @Override
    public NhaCungCap create(NhaCungCap ncc) {
        return nhaCungCapRepository.save(ncc);
    }

    @Override
    public NhaCungCap update(Long id, NhaCungCap ncc) {
        NhaCungCap existing = getById(id);
        existing.setTenNCC(ncc.getTenNCC());
        existing.setNguoiDaiDien(ncc.getNguoiDaiDien());
        existing.setDiaChi(ncc.getDiaChi());
        existing.setSdt(ncc.getSdt());
        existing.setEmail(ncc.getEmail());
        return nhaCungCapRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        getById(id);
        nhaCungCapRepository.deleteById(id);
    }
}
