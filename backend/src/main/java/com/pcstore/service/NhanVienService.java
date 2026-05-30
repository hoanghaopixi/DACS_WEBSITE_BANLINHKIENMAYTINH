package com.pcstore.service;

import com.pcstore.entity.NhanVien;

import java.util.List;

public interface NhanVienService {
    List<NhanVien> getAll();
    NhanVien getById(Long id);
    NhanVien create(NhanVien nv);
    NhanVien update(Long id, NhanVien nv);
    void delete(Long id);
}
