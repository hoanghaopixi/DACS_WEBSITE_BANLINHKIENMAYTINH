package com.pcstore.service;

import com.pcstore.entity.SanPham;
import java.util.List;

public interface SanPhamService {
    List<SanPham> getAll();
    List<SanPham> search(String keyword);
    List<SanPham> getByCategoryKeyword(String keyword);
    List<SanPham> getSuggestions(int limit);
    SanPham getById(Long id);
    SanPham create(SanPham sanPham);
    SanPham update(Long id, SanPham sanPham);
    void delete(Long id);
}
