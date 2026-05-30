package com.pcstore.controller;

import com.pcstore.dto.response.ApiResponse;
import com.pcstore.entity.QuangCao;
import com.pcstore.service.QuangCaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quang-cao")
@RequiredArgsConstructor
@CrossOrigin("*")
public class QuangCaoController {

    private final QuangCaoService quangCaoService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<QuangCao>>> getAll() {
        return ResponseEntity.ok(ApiResponse.<List<QuangCao>>builder()
                .code(200).message("Thành công")
                .data(quangCaoService.getAll()).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuangCao>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<QuangCao>builder()
                .code(200).message("Thành công")
                .data(quangCaoService.getById(id)).build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<QuangCao>> create(@RequestBody QuangCao qc) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<QuangCao>builder()
                .code(201).message("Tạo mới thành công")
                .data(quangCaoService.create(qc)).build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<QuangCao>> update(@PathVariable Long id, @RequestBody QuangCao qc) {
        return ResponseEntity.ok(ApiResponse.<QuangCao>builder()
                .code(200).message("Cập nhật thành công")
                .data(quangCaoService.update(id, qc)).build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        quangCaoService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200).message("Xóa thành công").build());
    }
}
