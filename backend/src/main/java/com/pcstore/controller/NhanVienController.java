package com.pcstore.controller;

import com.pcstore.dto.response.ApiResponse;
import com.pcstore.entity.NhanVien;
import com.pcstore.service.NhanVienService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nhan-vien")
@RequiredArgsConstructor
@CrossOrigin("*")
@PreAuthorize("hasRole('ADMIN')")
public class NhanVienController {

    private final NhanVienService nhanVienService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NhanVien>>> getAll() {
        return ResponseEntity.ok(ApiResponse.<List<NhanVien>>builder()
                .code(200).message("Thành công")
                .data(nhanVienService.getAll()).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NhanVien>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<NhanVien>builder()
                .code(200).message("Thành công")
                .data(nhanVienService.getById(id)).build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NhanVien>> create(@RequestBody NhanVien nv) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<NhanVien>builder()
                .code(201).message("Tạo mới thành công")
                .data(nhanVienService.create(nv)).build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NhanVien>> update(@PathVariable Long id, @RequestBody NhanVien nv) {
        return ResponseEntity.ok(ApiResponse.<NhanVien>builder()
                .code(200).message("Cập nhật thành công")
                .data(nhanVienService.update(id, nv)).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        nhanVienService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200).message("Xóa thành công").build());
    }
}
