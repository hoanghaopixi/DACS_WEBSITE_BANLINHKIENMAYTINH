package com.pcstore.controller;

import com.pcstore.dto.response.ApiResponse;
import com.pcstore.entity.KhachHang;
import com.pcstore.service.KhachHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/khach-hang")
@RequiredArgsConstructor
@CrossOrigin("*")
public class KhachHangController {

    private final KhachHangService khachHangService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<KhachHang>>> getAll() {
        return ResponseEntity.ok(ApiResponse.<List<KhachHang>>builder()
                .code(HttpStatus.OK.value())
                .message("Thành công")
                .data(khachHangService.getAll())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<KhachHang>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<KhachHang>builder()
                .code(HttpStatus.OK.value())
                .message("Thành công")
                .data(khachHangService.getById(id))
                .build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<KhachHang>> create(@RequestBody KhachHang khachHang) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<KhachHang>builder()
                .code(HttpStatus.CREATED.value())
                .message("Tạo mới thành công")
                .data(khachHangService.create(khachHang))
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<KhachHang>> update(@PathVariable Long id, @RequestBody KhachHang khachHang) {
        return ResponseEntity.ok(ApiResponse.<KhachHang>builder()
                .code(HttpStatus.OK.value())
                .message("Cập nhật thành công")
                .data(khachHangService.update(id, khachHang))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        khachHangService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Xóa thành công")
                .build());
    }
}
