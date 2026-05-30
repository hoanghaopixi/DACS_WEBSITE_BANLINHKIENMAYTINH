package com.pcstore.service.impl;

import com.pcstore.entity.NhanVien;
import com.pcstore.exception.ResourceNotFoundException;
import com.pcstore.repository.NhanVienRepository;
import com.pcstore.service.NhanVienService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NhanVienServiceImpl implements NhanVienService {

    private final NhanVienRepository nhanVienRepository;

    @Override
    public List<NhanVien> getAll() {
        return nhanVienRepository.findAll();
    }

    @Override
    public NhanVien getById(Long id) {
        return nhanVienRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên ID: " + id));
    }

    @Override
    public NhanVien create(NhanVien nv) {
        return nhanVienRepository.save(nv);
    }

    @Override
    public NhanVien update(Long id, NhanVien nv) {
        NhanVien existing = getById(id);
        existing.setHoTen(nv.getHoTen());
        existing.setChucVu(nv.getChucVu());
        existing.setLuong(nv.getLuong());
        existing.setSdt(nv.getSdt());
        existing.setEmail(nv.getEmail());
        existing.setDiaChi(nv.getDiaChi());
        existing.setNgaySinh(nv.getNgaySinh());
        existing.setGioiTinh(nv.getGioiTinh());
        return nhanVienRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        getById(id);
        nhanVienRepository.deleteById(id);
    }
}
