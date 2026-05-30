package com.pcstore.service.impl;

import com.pcstore.entity.DonHang;
import com.pcstore.entity.KhachHang;
import com.pcstore.exception.ResourceNotFoundException;
import com.pcstore.repository.DonHangRepository;
import com.pcstore.repository.KhachHangRepository;
import com.pcstore.service.DonHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DonHangServiceImpl implements DonHangService {

    private final DonHangRepository donHangRepository;
    private final KhachHangRepository khachHangRepository;
    private final com.pcstore.repository.XaRepository xaRepository;
    private final com.pcstore.repository.SanPhamRepository sanPhamRepository;
    private final com.pcstore.repository.ChiTietDonHangRepository chiTietDonHangRepository;
    private final com.pcstore.repository.HoaDonRepository hoaDonRepository;
    private final com.pcstore.repository.KhuyenMaiRepository khuyenMaiRepository;
    private final com.pcstore.repository.TaiKhoanRepository taiKhoanRepository;
    private final com.pcstore.repository.NhanVienRepository nhanVienRepository;


    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<DonHang> getAll() {
        List<DonHang> list = donHangRepository.findAllByOrderByMaDonHangDesc();
        list.forEach(dh -> {
            if (dh.getNhanVien() != null) {
                dh.getNhanVien().getHoTen(); // trigger lazy load
            }
            if (dh.getKhachHang() != null) {
                dh.getKhachHang().getHoTen();
            }
        });
        return list;
    }

    @Override
    public List<DonHang> getByKhachHangId(Long maKH) {
        return donHangRepository.findByKhachHang_MaKH(maKH);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public DonHang getById(Long id) {
        DonHang donHang = donHangRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + id));
        // Force initialize lazy collections for JSON serialization
        if (donHang.getKhachHang() != null) {
            donHang.getKhachHang().getHoTen(); // trigger lazy load
        }
        if (donHang.getXa() != null) {
            donHang.getXa().getTenXa(); // trigger lazy load
            if (donHang.getXa().getHuyen() != null) {
                donHang.getXa().getHuyen().getTenHuyen();
                if (donHang.getXa().getHuyen().getTinh() != null) {
                    donHang.getXa().getHuyen().getTinh().getTenTinh();
                }
            }
        }
        if (donHang.getChiTietDonHangs() != null) {
            donHang.getChiTietDonHangs().forEach(ct -> {
                if (ct.getSanPham() != null) {
                    ct.getSanPham().getTenSP(); // trigger lazy load
                }
            });
        }
        if (donHang.getNhanVien() != null) {
            donHang.getNhanVien().getHoTen();
        }
        return donHang;
    }


    @Override
    public DonHang create(DonHang donHang) {
        if (donHang.getKhachHang() == null || donHang.getKhachHang().getMaKH() == null) {
            throw new IllegalArgumentException("Khách hàng không được để trống");
        }
        KhachHang khachHang = khachHangRepository.findById(donHang.getKhachHang().getMaKH())
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng không tồn tại"));
        donHang.setKhachHang(khachHang);
        return donHangRepository.save(donHang);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public DonHang checkout(com.pcstore.dto.request.CheckoutRequest request) {
        Long maTK = null;
        Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof com.pcstore.security.UserPrincipal) {
            maTK = ((com.pcstore.security.UserPrincipal) principal).getId();
        } else if (principal instanceof String) {
            String username = (String) principal;
            maTK = taiKhoanRepository.findByTenDangNhapIgnoreCase(username)
                    .map(com.pcstore.entity.TaiKhoan::getMaTK)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));
        } else {
            throw new ResourceNotFoundException("Không thể xác định tài khoản");
        }

        com.pcstore.entity.TaiKhoan tk = taiKhoanRepository.findById(maTK)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));
        KhachHang khachHang = tk.getKhachHang();
        if (khachHang == null) throw new ResourceNotFoundException("Tài khoản chưa liên kết Khách hàng");

        com.pcstore.entity.Xa xa = xaRepository.findById(request.getMaXa())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy xã/phường"));

        // Validate coupon if provided
        Long maKM = request.getMaKM();
        java.math.BigDecimal soTienGiam = java.math.BigDecimal.ZERO;
        if (maKM != null) {
            com.pcstore.entity.KhuyenMai km = khuyenMaiRepository.findById(maKM).orElse(null);
            if (km != null) {
                int usageCount = khuyenMaiRepository.countUsageByCustomer(request.getKhachHangId(), maKM);
                if (usageCount > 0) {
                    throw new IllegalArgumentException("Bạn đã sử dụng mã khuyến mãi này rồi.");
                }
                soTienGiam = request.getSoTienGiam() != null
                        ? request.getSoTienGiam()
                        : java.math.BigDecimal.ZERO;
            }
        }

        DonHang donHang = DonHang.builder()
                .khachHang(khachHang)
                .xa(xa)
                .diaChiChiTiet(request.getDiaChiChiTiet())
                .tenNguoiNhan(request.getTenNguoiNhan())
                .sdtNguoiNhan(request.getSdtNguoiNhan())
                .phiVanChuyen(request.getPhiVanChuyen())
                .ghiChu(request.getGhiChu())
                .tongTien(request.getTongTien())
                .trangThai("Chờ xác nhận")
                .maKM(maKM)
                .soTienGiam(soTienGiam)
                .hinhThucThanhToan(request.getHinhThucThanhToan())
                .build();

        DonHang savedDonHang = donHangRepository.save(donHang);

        for (com.pcstore.dto.request.CheckoutRequest.CartItemRequest item : request.getItems()) {
            com.pcstore.entity.SanPham sp = sanPhamRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));

            com.pcstore.entity.ChiTietDonHang chiTiet = com.pcstore.entity.ChiTietDonHang.builder()
                    .donHang(savedDonHang)
                    .sanPham(sp)
                    .soLuong(item.getQuantity())
                    .donGia(item.getPrice())
                    .build();
            chiTietDonHangRepository.save(chiTiet);
        }

        // Không tạo HoaDon ở bước này nữa
        return savedDonHang;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public DonHang createManualOrder(com.pcstore.dto.request.ManualOrderRequest request) {
        // Lấy thông tin NV đang lập đơn
        com.pcstore.entity.NhanVien nhanVienLap = null;
        try {
            Long maTK = null;
            Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof com.pcstore.security.UserPrincipal) {
                maTK = ((com.pcstore.security.UserPrincipal) principal).getId();
            } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                String username = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
                maTK = taiKhoanRepository.findByTenDangNhapIgnoreCase(username)
                        .map(com.pcstore.entity.TaiKhoan::getMaTK)
                        .orElse(null);
            } else if (principal instanceof String) {
                String username = (String) principal;
                maTK = taiKhoanRepository.findByTenDangNhapIgnoreCase(username)
                        .map(com.pcstore.entity.TaiKhoan::getMaTK)
                        .orElse(null);
            }
            if (maTK != null) {
                com.pcstore.entity.TaiKhoan tk = taiKhoanRepository.findById(maTK).orElse(null);
                if (tk != null) {
                    nhanVienLap = tk.getNhanVien();
                    // Auto-create NhanVien if null for admin/staff
                    if (nhanVienLap == null) {
                        com.pcstore.entity.NhanVien newNv = com.pcstore.entity.NhanVien.builder()
                                .hoTen(tk.getTenDangNhap() != null ? tk.getTenDangNhap() : "Admin System")
                                .chucVu("Nhân viên hệ thống")
                                .email(tk.getEmail())
                                .sdt(tk.getSoDienThoai())
                                .luong(java.math.BigDecimal.ZERO)
                                .gioiTinh("Khác")
                                .build();
                        nhanVienLap = nhanVienRepository.save(newNv);
                        tk.setNhanVien(nhanVienLap);
                        taiKhoanRepository.save(tk);
                    }
                }
            }
        } catch (Exception e) {}

        KhachHang khachHang = null;
        if (request.getKhachHangId() != null) {
            khachHang = khachHangRepository.findById(request.getKhachHangId()).orElse(null);
        }
        
        // Nếu không có khách hàng (khách vãng lai), tạo hoặc lấy khách hàng mặc định.
        if (khachHang == null) {
            java.util.List<KhachHang> vlList = khachHangRepository.findAll().stream()
                .filter(kh -> kh.getSdt() != null && kh.getSdt().equals("0000000000"))
                .toList();
            if (!vlList.isEmpty()) {
                khachHang = vlList.get(0);
            } else {
                KhachHang newKh = KhachHang.builder()
                    .hoTen(request.getTenNguoiNhan() != null ? request.getTenNguoiNhan() : "Khách vãng lai")
                    .sdt(request.getSdtNguoiNhan() != null ? request.getSdtNguoiNhan() : "0000000000")
                    .diaChi(request.getDiaChiChiTiet() != null ? request.getDiaChiChiTiet() : "Tại cửa hàng")
                    .build();
                khachHang = khachHangRepository.save(newKh);
            }
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Đơn hàng phải có ít nhất 1 sản phẩm");
        }

        com.pcstore.entity.Xa xa = null;
        if (request.getMaXa() != null) {
            xa = xaRepository.findById(request.getMaXa()).orElse(null);
        }
        if (xa == null) {
            // Lấy xã đầu tiên làm mặc định nếu không có
            xa = xaRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new IllegalStateException("Hệ thống chưa cấu hình dữ liệu Xã/Phường. Vui lòng thêm Xã trước khi tạo đơn hàng."));
        }

        java.math.BigDecimal tongTien = java.math.BigDecimal.ZERO;
        for (com.pcstore.dto.request.ManualOrderRequest.CartItemRequest item : request.getItems()) {
            tongTien = tongTien.add(item.getPrice().multiply(new java.math.BigDecimal(item.getQuantity())));
        }
        
        if (request.getPhiVanChuyen() != null) {
            tongTien = tongTien.add(request.getPhiVanChuyen());
        }

        DonHang donHang = DonHang.builder()
                .khachHang(khachHang)
                .nhanVien(nhanVienLap)
                .xa(xa)
                .diaChiChiTiet(request.getDiaChiChiTiet() != null ? request.getDiaChiChiTiet() : "Tại cửa hàng")
                .tenNguoiNhan(request.getTenNguoiNhan() != null ? request.getTenNguoiNhan() : "Khách vãng lai")
                .sdtNguoiNhan(request.getSdtNguoiNhan() != null ? request.getSdtNguoiNhan() : "0000000000")
                .phiVanChuyen(request.getPhiVanChuyen() != null ? request.getPhiVanChuyen() : java.math.BigDecimal.ZERO)
                .ghiChu(request.getGhiChu())
                .tongTien(tongTien)
                .trangThai("Chờ xác nhận")
                .hinhThucThanhToan(request.getHinhThucThanhToan() != null ? request.getHinhThucThanhToan() : "Tiền mặt")
                .build();

        DonHang savedDonHang = donHangRepository.save(donHang);

        for (com.pcstore.dto.request.ManualOrderRequest.CartItemRequest item : request.getItems()) {
            com.pcstore.entity.SanPham sp = sanPhamRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại: " + item.getProductId()));

            com.pcstore.entity.ChiTietDonHang chiTiet = com.pcstore.entity.ChiTietDonHang.builder()
                    .donHang(savedDonHang)
                    .sanPham(sp)
                    .soLuong(item.getQuantity())
                    .donGia(item.getPrice())
                    .build();
            chiTietDonHangRepository.save(chiTiet);
            
            // Giảm số lượng tồn kho (nếu cần thiết) -> Tạm thời chưa trừ kho lúc Chờ xác nhận
        }
        return savedDonHang;
    }


    @Override
    @org.springframework.transaction.annotation.Transactional
    public DonHang update(Long id, DonHang details) {
        DonHang donHang = getById(id);
        boolean wasNotConfirmed = !"Đã xác nhận".equals(donHang.getTrangThai()) 
                               && !"Hoàn thành".equals(donHang.getTrangThai()) 
                               && !"Đang giao".equals(donHang.getTrangThai());
        
        if (details.getTrangThai() != null) {
            donHang.setTrangThai(details.getTrangThai());
        }
        if (details.getTongTien() != null) {
            donHang.setTongTien(details.getTongTien());
        }
        
        DonHang updatedDonHang = donHangRepository.save(donHang);
        
        // Logic tạo Hóa đơn khi Đơn hàng chuyển sang trạng thái được xác nhận (Đã xác nhận, Đang giao, Hoàn thành)
        if (wasNotConfirmed && ("Đã xác nhận".equals(details.getTrangThai()) || "Hoàn thành".equals(details.getTrangThai()) || "Đang giao".equals(details.getTrangThai()))) {
            java.util.Optional<com.pcstore.entity.HoaDon> existingHoaDon = hoaDonRepository.findByDonHang_MaDonHang(id);
            if (existingHoaDon.isEmpty()) {
                // Lấy thông tin NV duyệt
                com.pcstore.entity.NhanVien nhanVienDuyet = null;
                try {
                    Long maTK = null;
                    Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
                    if (principal instanceof com.pcstore.security.UserPrincipal) {
                        maTK = ((com.pcstore.security.UserPrincipal) principal).getId();
                    } else if (principal instanceof String) {
                        String username = (String) principal;
                        maTK = taiKhoanRepository.findByTenDangNhapIgnoreCase(username)
                                .map(com.pcstore.entity.TaiKhoan::getMaTK)
                                .orElse(null);
                    }
                    if (maTK != null) {
                        com.pcstore.entity.TaiKhoan tk = taiKhoanRepository.findById(maTK).orElse(null);
                        if (tk != null) nhanVienDuyet = tk.getNhanVien();
                    }
                } catch (Exception e) {}

                com.pcstore.entity.HoaDon hoaDon = com.pcstore.entity.HoaDon.builder()
                        .donHang(updatedDonHang)
                        .nhanVien(nhanVienDuyet)
                        .tongTien(updatedDonHang.getTongTien())
                        .trangThaiThanhToan("Chưa thanh toán")
                        .hinhThucThanhToan(updatedDonHang.getHinhThucThanhToan())
                        .vat(new java.math.BigDecimal("8.00"))
                        .phiDichVu(java.math.BigDecimal.ZERO)
                        .khuyenMai(updatedDonHang.getSoTienGiam())
                        .maKM(updatedDonHang.getMaKM())
                        .build();
                hoaDonRepository.save(hoaDon);
            }
        }

        // Logic hủy Hóa đơn nếu Đơn hàng bị hủy
        if (details.getTrangThai() != null && details.getTrangThai().equals("Đã hủy")) {
            java.util.Optional<com.pcstore.entity.HoaDon> existingHoaDon = hoaDonRepository.findByDonHang_MaDonHang(id);
            if (existingHoaDon.isPresent()) {
                com.pcstore.entity.HoaDon hd = existingHoaDon.get();
                hd.setTrangThaiThanhToan("Đã hủy");
                hoaDonRepository.save(hd);
            }
        }

        return updatedDonHang;
    }

    @Override
    public void delete(Long id) {
        DonHang donHang = getById(id);
        donHangRepository.delete(donHang);
    }
}
