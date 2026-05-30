package com.pcstore.controller;

import com.pcstore.dto.response.ApiResponse;
import com.pcstore.entity.NhaCungCap;
import com.pcstore.service.NhaCungCapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nha-cung-cap")
@RequiredArgsConstructor
@CrossOrigin("*")
@PreAuthorize("hasRole('ADMIN')")
public class NhaCungCapController {

    private final NhaCungCapService nhaCungCapService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NhaCungCap>>> getAll() {
        return ResponseEntity.ok(ApiResponse.<List<NhaCungCap>>builder()
                .code(200).message("Thành công")
                .data(nhaCungCapService.getAll()).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NhaCungCap>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<NhaCungCap>builder()
                .code(200).message("Thành công")
                .data(nhaCungCapService.getById(id)).build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NhaCungCap>> create(@RequestBody NhaCungCap ncc) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<NhaCungCap>builder()
                .code(201).message("Tạo mới thành công")
                .data(nhaCungCapService.create(ncc)).build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NhaCungCap>> update(@PathVariable Long id, @RequestBody NhaCungCap ncc) {
        return ResponseEntity.ok(ApiResponse.<NhaCungCap>builder()
                .code(200).message("Cập nhật thành công")
                .data(nhaCungCapService.update(id, ncc)).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        nhaCungCapService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200).message("Xóa thành công").build());
    }
}
