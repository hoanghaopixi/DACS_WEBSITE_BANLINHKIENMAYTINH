package com.pcstore.controller;

import com.pcstore.dto.response.ApiResponse;
import com.pcstore.entity.HoaDon;
import com.pcstore.service.HoaDonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hoa-don")
@RequiredArgsConstructor
@CrossOrigin("*")
@PreAuthorize("hasRole('ADMIN')")
public class HoaDonController {

    private final HoaDonService hoaDonService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<HoaDon>>> getAll() {
        return ResponseEntity.ok(ApiResponse.<List<HoaDon>>builder()
                .code(200).message("Thành công")
                .data(hoaDonService.getAll()).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HoaDon>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<HoaDon>builder()
                .code(200).message("Thành công")
                .data(hoaDonService.getById(id)).build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HoaDon>> update(@PathVariable Long id, @RequestBody HoaDon hoaDon) {
        return ResponseEntity.ok(ApiResponse.<HoaDon>builder()
                .code(200).message("Cập nhật hóa đơn thành công")
                .data(hoaDonService.update(id, hoaDon)).build());
    }
}
