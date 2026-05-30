package com.pcstore.service;

import com.pcstore.dto.request.DanhGiaRequest;
import com.pcstore.entity.DanhGia;

import java.util.List;

public interface DanhGiaService {
    List<DanhGia> getByProductId(Long maSP);
    DanhGia createReview(DanhGiaRequest request);
    DanhGia updateReview(Long id, DanhGiaRequest request);
    void deleteReview(Long id);
    DanhGia getMyReview(Long maSP);
}
