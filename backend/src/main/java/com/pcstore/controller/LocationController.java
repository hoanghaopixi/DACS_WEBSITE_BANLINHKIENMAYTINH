package com.pcstore.controller;

import com.pcstore.dto.response.ApiResponse;
import com.pcstore.entity.Huyen;
import com.pcstore.entity.Tinh;
import com.pcstore.entity.Xa;
import com.pcstore.repository.HuyenRepository;
import com.pcstore.repository.TinhRepository;
import com.pcstore.repository.XaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/location")
@RequiredArgsConstructor
@CrossOrigin("*")
public class LocationController {

    private final TinhRepository tinhRepository;
    private final HuyenRepository huyenRepository;
    private final XaRepository xaRepository;

    @GetMapping("/tinh")
    public ResponseEntity<ApiResponse<List<Tinh>>> getAllTinh() {
        return ResponseEntity.ok(ApiResponse.<List<Tinh>>builder()
                .code(HttpStatus.OK.value())
                .message("Thành công")
                .data(tinhRepository.findAll())
                .build());
    }

    @GetMapping("/huyen/{maTinh}")
    public ResponseEntity<ApiResponse<List<Huyen>>> getHuyenByTinh(@PathVariable Long maTinh) {
        return ResponseEntity.ok(ApiResponse.<List<Huyen>>builder()
                .code(HttpStatus.OK.value())
                .message("Thành công")
                .data(huyenRepository.findByTinh_MaTinh(maTinh))
                .build());
    }

    @GetMapping("/xa/{maHuyen}")
    public ResponseEntity<ApiResponse<List<Xa>>> getXaByHuyen(@PathVariable Long maHuyen) {
        return ResponseEntity.ok(ApiResponse.<List<Xa>>builder()
                .code(HttpStatus.OK.value())
                .message("Thành công")
                .data(xaRepository.findByHuyen_MaHuyen(maHuyen))
                .build());
    }
}
