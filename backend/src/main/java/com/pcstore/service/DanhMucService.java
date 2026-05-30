package com.pcstore.service;

import com.pcstore.entity.DanhMuc;
import java.util.List;

public interface DanhMucService {
    List<DanhMuc> getAll();
    DanhMuc getById(Long id);
    DanhMuc create(DanhMuc danhMuc);
    DanhMuc update(Long id, DanhMuc danhMuc);
    void delete(Long id);
}
