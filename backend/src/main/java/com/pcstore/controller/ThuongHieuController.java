package com.pcstore.controller;

import com.pcstore.dto.response.ApiResponse;
import com.pcstore.entity.ThuongHieu;
import com.pcstore.service.ThuongHieuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/thuong-hieu")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ThuongHieuController {

    private final ThuongHieuService thuongHieuService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ThuongHieu>>> getAll() {
        return ResponseEntity.ok(ApiResponse.<List<ThuongHieu>>builder()
                .code(HttpStatus.OK.value())
                .message("Thành công")
                .data(thuongHieuService.getAll())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ThuongHieu>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<ThuongHieu>builder()
                .code(HttpStatus.OK.value())
                .message("Thành công")
                .data(thuongHieuService.getById(id))
                .build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ThuongHieu>> create(@RequestBody ThuongHieu thuongHieu) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<ThuongHieu>builder()
                .code(HttpStatus.CREATED.value())
                .message("Tạo mới thành công")
                .data(thuongHieuService.create(thuongHieu))
                .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ThuongHieu>> update(@PathVariable Long id, @RequestBody ThuongHieu thuongHieu) {
        return ResponseEntity.ok(ApiResponse.<ThuongHieu>builder()
                .code(HttpStatus.OK.value())
                .message("Cập nhật thành công")
                .data(thuongHieuService.update(id, thuongHieu))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        thuongHieuService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Xóa thành công")
                .build());
    }
}
