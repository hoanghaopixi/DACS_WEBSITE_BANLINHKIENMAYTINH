package com.pcstore.controller;

import com.pcstore.dto.response.ApiResponse;
import com.pcstore.entity.DanhMuc;
import com.pcstore.service.DanhMucService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/danh-muc")
@RequiredArgsConstructor
@CrossOrigin("*")
public class DanhMucController {

    private final DanhMucService danhMucService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DanhMuc>>> getAll() {
        return ResponseEntity.ok(ApiResponse.<List<DanhMuc>>builder()
                .code(HttpStatus.OK.value())
                .message("Thành công")
                .data(danhMucService.getAll())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DanhMuc>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<DanhMuc>builder()
                .code(HttpStatus.OK.value())
                .message("Thành công")
                .data(danhMucService.getById(id))
                .build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DanhMuc>> create(@RequestBody DanhMuc danhMuc) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<DanhMuc>builder()
                .code(HttpStatus.CREATED.value())
                .message("Tạo mới thành công")
                .data(danhMucService.create(danhMuc))
                .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DanhMuc>> update(@PathVariable Long id, @RequestBody DanhMuc danhMuc) {
        return ResponseEntity.ok(ApiResponse.<DanhMuc>builder()
                .code(HttpStatus.OK.value())
                .message("Cập nhật thành công")
                .data(danhMucService.update(id, danhMuc))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        danhMucService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Xóa thành công")
                .build());
    }
}
