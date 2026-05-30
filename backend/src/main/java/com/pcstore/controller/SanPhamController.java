package com.pcstore.controller;

import com.pcstore.dto.response.ApiResponse;
import com.pcstore.dto.response.ProductResponse;
import com.pcstore.entity.SanPham;
import com.pcstore.service.SanPhamService;
import com.pcstore.utils.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/san-pham")
@RequiredArgsConstructor
@CrossOrigin("*")
public class SanPhamController {

    private final SanPhamService sanPhamService;
    private final com.pcstore.repository.ChiTietDonHangRepository chiTietDonHangRepository;

    private void populateSoldQuantities(List<ProductResponse> responses) {
        List<Object[]> soldMap = chiTietDonHangRepository.getSoldQuantityMap();
        java.util.Map<Long, Integer> soldDict = new java.util.HashMap<>();
        for (Object[] row : soldMap) {
            soldDict.put(((Number) row[0]).longValue(), ((Number) row[1]).intValue());
        }
        for (ProductResponse res : responses) {
            res.setSoLuongDaBan(soldDict.getOrDefault(res.getMaSP(), 0));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAll(
            @RequestParam(value = "keyword", required = false) String keyword
    ) {
        List<SanPham> sanPhams = keyword == null || keyword.isBlank()
                ? sanPhamService.getAll()
                : sanPhamService.search(keyword);

        List<ProductResponse> responses = sanPhams.stream().map(ProductMapper::toResponse).collect(Collectors.toList());
        populateSoldQuantities(responses);

        return ResponseEntity.ok(ApiResponse.<List<ProductResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Thành công")
                .data(responses)
                .build());
    }

    @GetMapping("/ban-chay")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getBestSellingByCategory(
            @RequestParam(value = "category", required = true) String category,
            @RequestParam(value = "limit", defaultValue = "4") int limit
    ) {
        List<SanPham> sanPhams = sanPhamService.getByCategoryKeyword(category);
        List<ProductResponse> responses = sanPhams.stream().map(ProductMapper::toResponse).collect(Collectors.toList());
        populateSoldQuantities(responses);
        
        responses.sort((p1, p2) -> Integer.compare(p2.getSoLuongDaBan() != null ? p2.getSoLuongDaBan() : 0, p1.getSoLuongDaBan() != null ? p1.getSoLuongDaBan() : 0));
        List<ProductResponse> topResponses = responses.stream().limit(limit).collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.<List<ProductResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Thành công")
                .data(topResponses)
                .build());
    }

    @GetMapping("/goi-y")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getSuggestions(
            @RequestParam(value = "limit", defaultValue = "6") int limit
    ) {
        List<ProductResponse> responses = sanPhamService.getSuggestions(limit).stream().map(ProductMapper::toResponse).collect(Collectors.toList());
        populateSoldQuantities(responses);

        return ResponseEntity.ok(ApiResponse.<List<ProductResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Thành công")
                .data(responses)
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(@PathVariable Long id) {
        ProductResponse response = ProductMapper.toResponse(sanPhamService.getById(id));
        List<ProductResponse> list = new java.util.ArrayList<>();
        list.add(response);
        populateSoldQuantities(list);

        return ResponseEntity.ok(ApiResponse.<ProductResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Thành công")
                .data(list.get(0))
                .build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SanPham>> create(@RequestBody SanPham sanPham) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<SanPham>builder()
                .code(HttpStatus.CREATED.value())
                .message("Tạo mới thành công")
                .data(sanPhamService.create(sanPham))
                .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SanPham>> update(@PathVariable Long id, @RequestBody SanPham sanPham) {
        return ResponseEntity.ok(ApiResponse.<SanPham>builder()
                .code(HttpStatus.OK.value())
                .message("Cập nhật thành công")
                .data(sanPhamService.update(id, sanPham))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        sanPhamService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Xóa thành công")
                .build());
    }
}
