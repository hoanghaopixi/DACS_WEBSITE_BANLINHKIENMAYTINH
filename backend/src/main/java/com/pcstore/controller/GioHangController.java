package com.pcstore.controller;

import com.pcstore.dto.response.ApiResponse;
import com.pcstore.entity.GioHang;
import com.pcstore.service.GioHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gio-hang")
@RequiredArgsConstructor
@CrossOrigin("*")
@PreAuthorize("hasRole('ADMIN')")
public class GioHangController {

    private final GioHangService gioHangService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GioHang>>> getAll() {
        return ResponseEntity.ok(ApiResponse.<List<GioHang>>builder()
                .code(200).message("Thành công")
                .data(gioHangService.getAll()).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GioHang>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<GioHang>builder()
                .code(200).message("Thành công")
                .data(gioHangService.getById(id)).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        gioHangService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200).message("Xóa giỏ hàng thành công").build());
    }
}
