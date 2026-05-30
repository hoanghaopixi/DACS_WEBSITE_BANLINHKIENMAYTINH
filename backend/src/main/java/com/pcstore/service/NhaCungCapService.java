package com.pcstore.service;

import com.pcstore.entity.NhaCungCap;

import java.util.List;

public interface NhaCungCapService {
    List<NhaCungCap> getAll();
    NhaCungCap getById(Long id);
    NhaCungCap create(NhaCungCap ncc);
    NhaCungCap update(Long id, NhaCungCap ncc);
    void delete(Long id);
}
