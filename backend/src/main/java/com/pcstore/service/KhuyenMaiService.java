package com.pcstore.service;

import com.pcstore.entity.KhuyenMai;

import java.util.List;

public interface KhuyenMaiService {
    List<KhuyenMai> getAll();
    KhuyenMai getById(Long id);
    KhuyenMai create(KhuyenMai km);
    KhuyenMai update(Long id, KhuyenMai km);
    void delete(Long id);

    /** Validate coupon for a specific customer. Returns the coupon if valid, throws if invalid/used. */
    KhuyenMai validateForCustomer(Long maKM, Long maKH);
}
