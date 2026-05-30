package com.pcstore.controller;

import com.pcstore.dto.response.ApiResponse;
import com.pcstore.entity.KhuyenMai;
import com.pcstore.service.KhuyenMaiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/khuyen-mai")
@RequiredArgsConstructor
@CrossOrigin("*")
public class KhuyenMaiController {

    private final KhuyenMaiService khuyenMaiService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<KhuyenMai>>> getAll() {
        return ResponseEntity.ok(ApiResponse.<List<KhuyenMai>>builder()
                .code(200).message("Thành công")
                .data(khuyenMaiService.getAll()).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<KhuyenMai>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<KhuyenMai>builder()
                .code(200).message("Thành công")
                .data(khuyenMaiService.getById(id)).build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<KhuyenMai>> create(@RequestBody KhuyenMai km) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<KhuyenMai>builder()
                .code(201).message("Tạo mới thành công")
                .data(khuyenMaiService.create(km)).build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<KhuyenMai>> update(@PathVariable Long id, @RequestBody KhuyenMai km) {
        return ResponseEntity.ok(ApiResponse.<KhuyenMai>builder()
                .code(200).message("Cập nhật thành công")
                .data(khuyenMaiService.update(id, km)).build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        khuyenMaiService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200).message("Xóa thành công").build());
    }

    /**
     * Validate coupon for a specific customer before checkout.
     * GET /api/khuyen-mai/{id}/validate?maKH=123
     */
    @GetMapping("/{id}/validate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validate(
            @PathVariable Long id,
            @RequestParam Long maKH) {
        try {
            KhuyenMai km = khuyenMaiService.validateForCustomer(id, maKH);
            Map<String, Object> result = Map.of(
                    "valid", true,
                    "tenKM", km.getTenKM(),
                    "phanTramGiam", km.getPhanTramGiam(),
                    "maKM", km.getMaKM()
            );
            return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                    .code(200).message("Mã hợp lệ").data(result).build());
        } catch (IllegalArgumentException e) {
            Map<String, Object> result = Map.of("valid", false, "message", e.getMessage());
            return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                    .code(400).message(e.getMessage()).data(result).build());
        }
    }
}
