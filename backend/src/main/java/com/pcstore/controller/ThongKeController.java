package com.pcstore.controller;

import com.pcstore.dto.response.ApiResponse;
import com.pcstore.dto.response.DashboardStatsResponse;
import com.pcstore.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/thong-ke")
@RequiredArgsConstructor
@CrossOrigin("*")
@PreAuthorize("hasRole('ADMIN')")
public class ThongKeController {

    private final StatisticsService statisticsService;

    @GetMapping("/tong-quan")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.<DashboardStatsResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Thành công")
                .data(statisticsService.getDashboardStats())
                .build());
    }

    @GetMapping("/nang-cao")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getAdvancedStats(
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "bestseller") String type,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(ApiResponse.<java.util.Map<String, Object>>builder()
                .code(HttpStatus.OK.value())
                .message("Thành công")
                .data(statisticsService.getAdvancedStats(type, limit))
                .build());
    }
}
