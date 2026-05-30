package com.pcstore.controller;

import com.pcstore.dto.response.ApiResponse;
import com.pcstore.entity.TaiKhoan;
import com.pcstore.service.TaiKhoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tai-khoan")
@RequiredArgsConstructor
@CrossOrigin("*")
@PreAuthorize("hasRole('ADMIN')")
public class TaiKhoanController {

    private final TaiKhoanService taiKhoanService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaiKhoan>>> getAll() {
        return ResponseEntity.ok(ApiResponse.<List<TaiKhoan>>builder()
                .code(200).message("Thành công")
                .data(taiKhoanService.getAll()).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaiKhoan>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<TaiKhoan>builder()
                .code(200).message("Thành công")
                .data(taiKhoanService.getById(id)).build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaiKhoan>> update(@PathVariable Long id, @RequestBody TaiKhoan tk) {
        return ResponseEntity.ok(ApiResponse.<TaiKhoan>builder()
                .code(200).message("Cập nhật thành công")
                .data(taiKhoanService.update(id, tk)).build());
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(@PathVariable Long id) {
        taiKhoanService.toggleStatus(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200).message("Đã thay đổi trạng thái tài khoản").build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        taiKhoanService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200).message("Xóa thành công").build());
    }
}
