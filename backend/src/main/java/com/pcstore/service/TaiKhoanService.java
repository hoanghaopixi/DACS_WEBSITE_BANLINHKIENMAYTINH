package com.pcstore.service;

import com.pcstore.entity.TaiKhoan;

import java.util.List;

public interface TaiKhoanService {
    List<TaiKhoan> getAll();
    TaiKhoan getById(Long id);
    TaiKhoan update(Long id, TaiKhoan tk);
    void toggleStatus(Long id);
    void delete(Long id);
}
