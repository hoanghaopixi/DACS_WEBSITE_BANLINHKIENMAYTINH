package com.pcstore.service.impl;

import com.pcstore.dto.request.DanhGiaRequest;
import com.pcstore.entity.*;
import com.pcstore.exception.ResourceNotFoundException;
import com.pcstore.repository.*;
import com.pcstore.service.DanhGiaService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DanhGiaServiceImpl implements DanhGiaService {

    private final DanhGiaRepository danhGiaRepository;
    private final SanPhamRepository sanPhamRepository;
    private final TaiKhoanRepository taiKhoanRepository;

    private KhachHang getCurrentKhachHang() {
        org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new IllegalArgumentException("Yêu cầu đăng nhập để đánh giá");
        }

        Long maTK;
        try {
            com.pcstore.security.UserPrincipal userPrincipal = (com.pcstore.security.UserPrincipal) auth.getPrincipal();
            maTK = userPrincipal.getId();
        } catch (Exception e) {
            throw new IllegalArgumentException("Yêu cầu đăng nhập để đánh giá");
        }
        
        TaiKhoan tk = taiKhoanRepository.findById(maTK)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));
        
        KhachHang kh = tk.getKhachHang();
        if (kh == null) {
            throw new IllegalArgumentException("Tài khoản của bạn chưa liên kết với hồ sơ khách hàng. Vui lòng cập nhật thông tin cá nhân trước khi đánh giá.");
        }
        return kh;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DanhGia> getByProductId(Long maSP) {
        List<DanhGia> list = danhGiaRepository.findBySanPham_MaSPOrderByNgayDanhGiaDesc(maSP);
        list.forEach(dg -> {
            if (dg.getKhachHang() != null) dg.getKhachHang().getHoTen();
            if (dg.getHinhAnhDanhGias() != null) dg.getHinhAnhDanhGias().size();
        });
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public DanhGia getMyReview(Long maSP) {
        KhachHang kh = getCurrentKhachHang();
        Optional<DanhGia> dg = danhGiaRepository.findByKhachHang_MaKHAndSanPham_MaSP(kh.getMaKH(), maSP);
        if (dg.isPresent()) {
            if (dg.get().getHinhAnhDanhGias() != null) dg.get().getHinhAnhDanhGias().size();
            return dg.get();
        }
        return null;
    }

    @Override
    @Transactional
    public DanhGia createReview(DanhGiaRequest request) {
        KhachHang kh = getCurrentKhachHang();
        SanPham sp = sanPhamRepository.findById(request.getMaSP())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm"));

        Optional<DanhGia> existing = danhGiaRepository.findByKhachHang_MaKHAndSanPham_MaSP(kh.getMaKH(), sp.getMaSP());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Bạn đã đánh giá sản phẩm này rồi. Bạn có thể sửa lại đánh giá.");
        }

        DanhGia dg = DanhGia.builder()
                .khachHang(kh)
                .sanPham(sp)
                .diemSao(request.getDiemSao())
                .noiDung(request.getNoiDung())
                .build();

        if (request.getMediaList() != null && !request.getMediaList().isEmpty()) {
            List<HinhAnhDanhGia> mediaEntities = new ArrayList<>();
            for (DanhGiaRequest.Media m : request.getMediaList()) {
                mediaEntities.add(HinhAnhDanhGia.builder()
                        .danhGia(dg)
                        .url(m.getUrl())
                        .loai(m.getLoai() != null ? m.getLoai() : "IMAGE")
                        .build());
            }
            dg.setHinhAnhDanhGias(mediaEntities);
        }

        return danhGiaRepository.save(dg);
    }

    @Override
    @Transactional
    public DanhGia updateReview(Long id, DanhGiaRequest request) {
        KhachHang kh = getCurrentKhachHang();
        DanhGia dg = danhGiaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá"));

        if (!dg.getKhachHang().getMaKH().equals(kh.getMaKH())) {
            throw new IllegalArgumentException("Bạn không có quyền sửa đánh giá này");
        }

        dg.setDiemSao(request.getDiemSao());
        dg.setNoiDung(request.getNoiDung());
        dg.setDaChinhSua(true);

        // Update media
        if (dg.getHinhAnhDanhGias() != null) {
            dg.getHinhAnhDanhGias().clear();
        } else {
            dg.setHinhAnhDanhGias(new ArrayList<>());
        }

        if (request.getMediaList() != null && !request.getMediaList().isEmpty()) {
            for (DanhGiaRequest.Media m : request.getMediaList()) {
                dg.getHinhAnhDanhGias().add(HinhAnhDanhGia.builder()
                        .danhGia(dg)
                        .url(m.getUrl())
                        .loai(m.getLoai() != null ? m.getLoai() : "IMAGE")
                        .build());
            }
        }

        return danhGiaRepository.save(dg);
    }

    @Override
    @Transactional
    public void deleteReview(Long id) {
        danhGiaRepository.deleteById(id);
    }
}
