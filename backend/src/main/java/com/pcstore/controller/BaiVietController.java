package com.pcstore.controller;

import com.pcstore.dto.request.BaiVietRequest;
import com.pcstore.dto.response.ApiResponse;
import com.pcstore.entity.BaiViet;
import com.pcstore.service.BaiVietService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bai-viet")
@RequiredArgsConstructor
@CrossOrigin("*")
public class BaiVietController {

    private final BaiVietService baiVietService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BaiViet>>> getAll() {
        return ResponseEntity.ok(ApiResponse.<List<BaiViet>>builder()
                .code(200).message("Thành công")
                .data(baiVietService.getAll()).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BaiViet>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<BaiViet>builder()
                .code(200).message("Thành công")
                .data(baiVietService.getById(id)).build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BaiViet>> create(@RequestBody BaiVietRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<BaiViet>builder()
                .code(201).message("Tạo bài viết thành công")
                .data(baiVietService.create(request)).build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BaiViet>> update(@PathVariable Long id, @RequestBody BaiVietRequest request) {
        return ResponseEntity.ok(ApiResponse.<BaiViet>builder()
                .code(200).message("Cập nhật bài viết thành công")
                .data(baiVietService.update(id, request)).build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        baiVietService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200).message("Xóa thành công").build());
    }
}
