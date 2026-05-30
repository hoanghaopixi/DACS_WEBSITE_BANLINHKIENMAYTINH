package com.pcstore.controller;

import com.pcstore.dto.response.ApiResponse;
import com.pcstore.entity.VaiTro;
import com.pcstore.repository.VaiTroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vai-tro")
@RequiredArgsConstructor
@CrossOrigin("*")
@PreAuthorize("hasRole('ADMIN')")
public class VaiTroController {

    private final VaiTroRepository vaiTroRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VaiTro>>> getAll() {
        return ResponseEntity.ok(ApiResponse.<List<VaiTro>>builder()
                .code(200).message("Thành công")
                .data(vaiTroRepository.findAll()).build());
    }
}
