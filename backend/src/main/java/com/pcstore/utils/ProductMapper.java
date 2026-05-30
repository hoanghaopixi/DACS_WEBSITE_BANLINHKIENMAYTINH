package com.pcstore.utils;

import com.pcstore.dto.response.ProductResponse;
import com.pcstore.entity.SanPham;

import java.util.Optional;

public final class ProductMapper {
    private ProductMapper() {
    }

    public static ProductResponse toResponse(SanPham sanPham) {
        ProductResponse response = new ProductResponse();
        response.setMaSP(sanPham.getMaSP());
        response.setTenSP(sanPham.getTenSP());
        response.setGiaNhap(sanPham.getGiaNhap());
        response.setGiaBan(sanPham.getGiaBan());
        response.setGiaKM(sanPham.getGiaKM());
        response.setHinhAnh(sanPham.getHinhAnh());
        response.setMoTa(sanPham.getMoTa());
        response.setSoLuongTon(sanPham.getSoLuongTon());
        response.setTonToiThieu(sanPham.getTonToiThieu());
        response.setBaoHanh(sanPham.getBaoHanh());
        response.setHinhAnhSanPhams(sanPham.getHinhAnhSanPhams());

        response.setMaDanhMuc(
                Optional.ofNullable(sanPham.getDanhMuc())
                        .map(dm -> dm.getMaDanhMuc())
                        .orElse(null)
        );
        response.setDanhMucTen(
                Optional.ofNullable(sanPham.getDanhMuc())
                        .map(dm -> dm.getTenDanhMuc())
                        .orElse("Khác")
        );
        response.setMaThuongHieu(
                Optional.ofNullable(sanPham.getThuongHieu())
                        .map(th -> th.getMaThuongHieu())
                        .orElse(null)
        );
        response.setThuongHieuTen(
                Optional.ofNullable(sanPham.getThuongHieu())
                        .map(th -> th.getTenThuongHieu())
                        .orElse(null)
        );
        response.setReviewCount(
                sanPham.getDanhGias() != null ? sanPham.getDanhGias().size() : 0
        );
        if (sanPham.getDanhGias() != null && !sanPham.getDanhGias().isEmpty()) {
            double avg = sanPham.getDanhGias().stream().mapToInt(com.pcstore.entity.DanhGia::getDiemSao).average().orElse(0.0);
            response.setAverageRating(Math.round(avg * 10.0) / 10.0);
        } else {
            response.setAverageRating(0.0);
        }
        return response;
    }
}
