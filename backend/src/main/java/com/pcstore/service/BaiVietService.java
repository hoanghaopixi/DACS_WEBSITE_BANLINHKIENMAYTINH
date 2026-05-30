package com.pcstore.service;

import com.pcstore.dto.request.BaiVietRequest;
import com.pcstore.entity.BaiViet;

import java.util.List;

public interface BaiVietService {
    List<BaiViet> getAll();
    BaiViet getById(Long id);
    BaiViet create(BaiVietRequest request);
    BaiViet update(Long id, BaiVietRequest request);
    void delete(Long id);
}
