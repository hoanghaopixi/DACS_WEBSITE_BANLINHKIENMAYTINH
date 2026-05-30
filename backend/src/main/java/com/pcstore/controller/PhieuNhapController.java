package com.pcstore.controller;

import com.pcstore.dto.request.PhieuNhapRequest;
import com.pcstore.dto.response.ApiResponse;
import com.pcstore.entity.ChiTietPhieuNhap;
import com.pcstore.entity.PhieuNhap;
import com.pcstore.service.PhieuNhapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/phieu-nhap")
@RequiredArgsConstructor
@CrossOrigin("*")
@PreAuthorize("hasRole('ADMIN')")
public class PhieuNhapController {

    private final PhieuNhapService phieuNhapService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PhieuNhap>>> getAll() {
        return ResponseEntity.ok(ApiResponse.<List<PhieuNhap>>builder()
                .code(200).message("Thành công")
                .data(phieuNhapService.getAll()).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PhieuNhap>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<PhieuNhap>builder()
                .code(200).message("Thành công")
                .data(phieuNhapService.getById(id)).build());
    }

    @GetMapping("/{id}/chi-tiet")
    public ResponseEntity<ApiResponse<List<ChiTietPhieuNhap>>> getChiTiet(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<List<ChiTietPhieuNhap>>builder()
                .code(200).message("Thành công")
                .data(phieuNhapService.getChiTietByPhieuNhap(id)).build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PhieuNhap>> create(@RequestBody PhieuNhapRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<PhieuNhap>builder()
                .code(201).message("Tạo Phiếu Nhập thành công")
                .data(phieuNhapService.create(request)).build());
    }
}
