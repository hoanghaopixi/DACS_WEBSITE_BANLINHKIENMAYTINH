package com.pcstore.service.impl;

import com.pcstore.entity.TaiKhoan;
import com.pcstore.entity.VaiTro;
import com.pcstore.exception.ResourceNotFoundException;
import com.pcstore.repository.KhachHangRepository;
import com.pcstore.repository.TaiKhoanRepository;
import com.pcstore.repository.VaiTroRepository;
import com.pcstore.service.TaiKhoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TaiKhoanServiceImpl implements TaiKhoanService {

    private final TaiKhoanRepository taiKhoanRepository;
    private final VaiTroRepository vaiTroRepository;
    private final com.pcstore.repository.NhanVienRepository nhanVienRepository;
    private final KhachHangRepository khachHangRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TaiKhoan> getAll() {
        List<TaiKhoan> list = taiKhoanRepository.findAll();
        list.forEach(tk -> {
            if (tk.getKhachHang() != null) tk.getKhachHang().getHoTen();
            if (tk.getNhanVien() != null) tk.getNhanVien().getHoTen();
            if (tk.getVaiTros() != null) tk.getVaiTros().size();
        });
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public TaiKhoan getById(Long id) {
        TaiKhoan tk = taiKhoanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản ID: " + id));
        if (tk.getKhachHang() != null) tk.getKhachHang().getHoTen();
        if (tk.getNhanVien() != null) tk.getNhanVien().getHoTen();
        if (tk.getVaiTros() != null) tk.getVaiTros().size();
        return tk;
    }

    @Override
    @Transactional
    public TaiKhoan update(Long id, TaiKhoan tk) {
        TaiKhoan existing = getById(id);
        existing.setEmail(tk.getEmail());
        existing.setSoDienThoai(tk.getSoDienThoai());
        existing.setTrangThai(tk.getTrangThai());

        // Liên kết Khách hàng
        if (tk.getKhachHang() != null && tk.getKhachHang().getMaKH() != null) {
            com.pcstore.entity.KhachHang kh = khachHangRepository.findById(tk.getKhachHang().getMaKH())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Khách hàng"));
            existing.setKhachHang(kh);
        } else if (tk.getKhachHang() == null) {
            existing.setKhachHang(null);
        }

        // Liên kết Nhân viên (ưu tiên cao hơn KH)
        if (tk.getNhanVien() != null && tk.getNhanVien().getMaNV() != null) {
            com.pcstore.entity.NhanVien nv = nhanVienRepository.findById(tk.getNhanVien().getMaNV())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Nhân viên"));
            existing.setNhanVien(nv);
            // NV ưu tiên: đổ thông tin từ NV sang TK
            existing.setEmail(nv.getEmail());
            existing.setSoDienThoai(nv.getSdt());
        } else if (tk.getNhanVien() == null) {
            existing.setNhanVien(null);
            // Nếu bỏ NV nhưng còn KH, đổ thông tin KH
            if (existing.getKhachHang() != null) {
                if (existing.getKhachHang().getEmail() != null) {
                    existing.setEmail(existing.getKhachHang().getEmail());
                }
                if (existing.getKhachHang().getSdt() != null) {
                    existing.setSoDienThoai(existing.getKhachHang().getSdt());
                }
            }
        }

        // Cập nhật vai trò
        if (tk.getVaiTros() != null) {
            Set<VaiTro> newRoles = new LinkedHashSet<>();
            for (VaiTro vt : tk.getVaiTros()) {
                if (vt.getMaVaiTro() != null) {
                    VaiTro role = vaiTroRepository.findById(vt.getMaVaiTro())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vai trò ID: " + vt.getMaVaiTro()));
                    newRoles.add(role);
                }
            }
            existing.setVaiTros(newRoles);
        }
        
        return taiKhoanRepository.save(existing);
    }

    @Override
    @Transactional
    public void toggleStatus(Long id) {
        TaiKhoan tk = getById(id);
        tk.setTrangThai(!tk.getTrangThai());
        taiKhoanRepository.save(tk);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        getById(id);
        taiKhoanRepository.deleteById(id);
    }
}
