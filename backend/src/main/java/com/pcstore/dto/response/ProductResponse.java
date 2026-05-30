package com.pcstore.dto.response;

import java.math.BigDecimal;

public class ProductResponse {
    private Long maSP;
    private String tenSP;
    private BigDecimal giaNhap;
    private BigDecimal giaBan;
    private BigDecimal giaKM;
    private String hinhAnh;
    private String moTa;
    private Integer soLuongTon;
    private Integer tonToiThieu;
    private Integer baoHanh;
    private Long maDanhMuc;
    private String danhMucTen;
    private Long maThuongHieu;
    private String thuongHieuTen;
    private Integer reviewCount;
    private Double averageRating;
    private Integer soLuongDaBan;
    private java.util.List<com.pcstore.entity.HinhAnhSanPham> hinhAnhSanPhams;

    public java.util.List<com.pcstore.entity.HinhAnhSanPham> getHinhAnhSanPhams() { return hinhAnhSanPhams; }
    public void setHinhAnhSanPhams(java.util.List<com.pcstore.entity.HinhAnhSanPham> hinhAnhSanPhams) { this.hinhAnhSanPhams = hinhAnhSanPhams; }

    public Long getMaSP() { return maSP; }
    public void setMaSP(Long maSP) { this.maSP = maSP; }

    public String getTenSP() { return tenSP; }
    public void setTenSP(String tenSP) { this.tenSP = tenSP; }

    public BigDecimal getGiaNhap() { return giaNhap; }
    public void setGiaNhap(BigDecimal giaNhap) { this.giaNhap = giaNhap; }

    public BigDecimal getGiaBan() { return giaBan; }
    public void setGiaBan(BigDecimal giaBan) { this.giaBan = giaBan; }

    public BigDecimal getGiaKM() { return giaKM; }
    public void setGiaKM(BigDecimal giaKM) { this.giaKM = giaKM; }

    public String getHinhAnh() { return hinhAnh; }
    public void setHinhAnh(String hinhAnh) { this.hinhAnh = hinhAnh; }

    public String getMoTa() { return moTa; }
    public void setMoTa(String moTa) { this.moTa = moTa; }

    public Integer getSoLuongTon() { return soLuongTon; }
    public void setSoLuongTon(Integer soLuongTon) { this.soLuongTon = soLuongTon; }

    public Integer getTonToiThieu() { return tonToiThieu; }
    public void setTonToiThieu(Integer tonToiThieu) { this.tonToiThieu = tonToiThieu; }

    public Integer getBaoHanh() { return baoHanh; }
    public void setBaoHanh(Integer baoHanh) { this.baoHanh = baoHanh; }

    public Long getMaDanhMuc() { return maDanhMuc; }
    public void setMaDanhMuc(Long maDanhMuc) { this.maDanhMuc = maDanhMuc; }

    public String getDanhMucTen() { return danhMucTen; }
    public void setDanhMucTen(String danhMucTen) { this.danhMucTen = danhMucTen; }

    public Long getMaThuongHieu() { return maThuongHieu; }
    public void setMaThuongHieu(Long maThuongHieu) { this.maThuongHieu = maThuongHieu; }

    public String getThuongHieuTen() { return thuongHieuTen; }
    public void setThuongHieuTen(String thuongHieuTen) { this.thuongHieuTen = thuongHieuTen; }

    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    
    public Integer getSoLuongDaBan() { return soLuongDaBan; }
    public void setSoLuongDaBan(Integer soLuongDaBan) { this.soLuongDaBan = soLuongDaBan; }
}
