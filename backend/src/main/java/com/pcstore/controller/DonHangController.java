package com.pcstore.controller;

import com.pcstore.dto.response.ApiResponse;
import com.pcstore.entity.DonHang;
import com.pcstore.service.DonHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/don-hang")
@RequiredArgsConstructor
@CrossOrigin("*")
public class DonHangController {

    private final DonHangService donHangService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<DonHang>>> getAll() {
        return ResponseEntity.ok(ApiResponse.<List<DonHang>>builder()
                .code(HttpStatus.OK.value())
                .message("Thành công")
                .data(donHangService.getAll())
                .build());
    }

    @GetMapping("/khach-hang/{id}")
    public ResponseEntity<ApiResponse<List<DonHang>>> getByKhachHangId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<List<DonHang>>builder()
                .code(HttpStatus.OK.value())
                .message("Thành công")
                .data(donHangService.getByKhachHangId(id))
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DonHang>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<DonHang>builder()
                .code(HttpStatus.OK.value())
                .message("Thành công")
                .data(donHangService.getById(id))
                .build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DonHang>> create(@RequestBody DonHang donHang) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<DonHang>builder()
                .code(HttpStatus.CREATED.value())
                .message("Tạo mới thành công")
                .data(donHangService.create(donHang))
                .build());
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<DonHang>> checkout(@RequestBody com.pcstore.dto.request.CheckoutRequest request) {
        DonHang savedDonHang = donHangService.checkout(request);
        return ResponseEntity.ok(ApiResponse.<DonHang>builder()
                .code(HttpStatus.OK.value())
                .message("Đặt hàng thành công")
                .data(savedDonHang)
                .build());
    }

    @PostMapping("/manual")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DonHang>> createManual(@RequestBody com.pcstore.dto.request.ManualOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.<DonHang>builder()
                .code(HttpStatus.OK.value())
                .message("Tạo đơn hàng thành công")
                .data(donHangService.createManualOrder(request))
                .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DonHang>> update(@PathVariable Long id, @RequestBody DonHang donHang) {
        return ResponseEntity.ok(ApiResponse.<DonHang>builder()
                .code(HttpStatus.OK.value())
                .message("Cập nhật thành công")
                .data(donHangService.update(id, donHang))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        donHangService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Xóa thành công")
                .build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<DonHang>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        DonHang donHang = donHangService.getById(id);
        donHang.setTrangThai(status);
        return ResponseEntity.ok(ApiResponse.<DonHang>builder()
                .code(HttpStatus.OK.value())
                .message("Cập nhật trạng thái thành công")
                .data(donHangService.update(id, donHang))
                .build());
    }
}
