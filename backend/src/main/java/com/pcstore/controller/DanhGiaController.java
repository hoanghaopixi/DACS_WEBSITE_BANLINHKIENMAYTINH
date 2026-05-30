package com.pcstore.controller;

import com.pcstore.dto.request.DanhGiaRequest;
import com.pcstore.dto.response.ApiResponse;
import com.pcstore.entity.DanhGia;
import com.pcstore.service.DanhGiaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/danh-gia")
@RequiredArgsConstructor
@CrossOrigin("*")
public class DanhGiaController {

    private final DanhGiaService danhGiaService;

    @GetMapping("/san-pham/{maSP}")
    public ResponseEntity<ApiResponse<List<DanhGia>>> getByProductId(@PathVariable Long maSP) {
        return ResponseEntity.ok(ApiResponse.<List<DanhGia>>builder()
                .code(HttpStatus.OK.value())
                .message("Thành công")
                .data(danhGiaService.getByProductId(maSP))
                .build());
    }

    @GetMapping("/me/san-pham/{maSP}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DanhGia>> getMyReview(@PathVariable Long maSP) {
        return ResponseEntity.ok(ApiResponse.<DanhGia>builder()
                .code(HttpStatus.OK.value())
                .message("Thành công")
                .data(danhGiaService.getMyReview(maSP))
                .build());
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DanhGia>> createReview(@RequestBody DanhGiaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<DanhGia>builder()
                .code(HttpStatus.CREATED.value())
                .message("Tạo đánh giá thành công")
                .data(danhGiaService.createReview(request))
                .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DanhGia>> updateReview(@PathVariable Long id, @RequestBody DanhGiaRequest request) {
        return ResponseEntity.ok(ApiResponse.<DanhGia>builder()
                .code(HttpStatus.OK.value())
                .message("Cập nhật đánh giá thành công")
                .data(danhGiaService.updateReview(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long id) {
        danhGiaService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Xóa đánh giá thành công")
                .build());
    }
}
