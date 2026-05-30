package com.pcstore.controller;

import com.pcstore.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin("*")
@Slf4j
public class UploadController {

    private static final String UPLOAD_DIR = "upload/product-images/";

    @PostMapping("/product-image")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadProductImage(
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.<Map<String, String>>builder()
                        .code(400).message("File trống").build());
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(ApiResponse.<Map<String, String>>builder()
                        .code(400).message("Chỉ chấp nhận file ảnh").build());
            }

            // Create upload directory if not exists
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath);

            // Return the URL path
            String imageUrl = "/api/upload/product-images/" + newFilename;

            log.info("Uploaded product image: {}", imageUrl);

            return ResponseEntity.ok(ApiResponse.<Map<String, String>>builder()
                    .code(200)
                    .message("Upload thành công")
                    .data(Map.of("url", imageUrl))
                    .build());

        } catch (IOException e) {
            log.error("Lỗi upload ảnh: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Map<String, String>>builder()
                            .code(500).message("Lỗi khi upload ảnh: " + e.getMessage()).build());
        }
    }

    @PostMapping("/post-image")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadPostImage(
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.<Map<String, String>>builder()
                        .code(400).message("File trống").build());
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(ApiResponse.<Map<String, String>>builder()
                        .code(400).message("Chỉ chấp nhận file ảnh").build());
            }

            Path uploadPath = Paths.get("upload/post-images/");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = UUID.randomUUID().toString() + extension;

            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath);

            String imageUrl = "/api/upload/post-images/" + newFilename;
            log.info("Uploaded post image: {}", imageUrl);

            return ResponseEntity.ok(ApiResponse.<Map<String, String>>builder()
                    .code(200)
                    .message("Upload thành công")
                    .data(Map.of("url", imageUrl))
                    .build());

        } catch (IOException e) {
            log.error("Lỗi upload ảnh bài viết: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Map<String, String>>builder()
                            .code(500).message("Lỗi khi upload ảnh: " + e.getMessage()).build());
        }
    }

    @PostMapping("/avatar")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAvatar(
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.<Map<String, String>>builder()
                        .code(400).message("File trống").build());
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(ApiResponse.<Map<String, String>>builder()
                        .code(400).message("Chỉ chấp nhận file ảnh").build());
            }

            Path uploadPath = Paths.get("upload/avatars/");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = UUID.randomUUID().toString() + extension;

            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath);

            String imageUrl = "/api/upload/avatars/" + newFilename;
            log.info("Uploaded avatar: {}", imageUrl);

            return ResponseEntity.ok(ApiResponse.<Map<String, String>>builder()
                    .code(200)
                    .message("Upload thành công")
                    .data(Map.of("url", imageUrl))
                    .build());

        } catch (IOException e) {
            log.error("Lỗi upload avatar: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Map<String, String>>builder()
                            .code(500).message("Lỗi khi upload ảnh: " + e.getMessage()).build());
        }
    }

    @PostMapping("/ad-banner")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAdBanner(
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.<Map<String, String>>builder()
                        .code(400).message("File trống").build());
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(ApiResponse.<Map<String, String>>builder()
                        .code(400).message("Chỉ chấp nhận file ảnh").build());
            }

            Path uploadPath = Paths.get("upload/ad-banners/");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = UUID.randomUUID().toString() + extension;

            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath);

            String imageUrl = "/api/upload/ad-banners/" + newFilename;
            log.info("Uploaded ad banner: {}", imageUrl);

            return ResponseEntity.ok(ApiResponse.<Map<String, String>>builder()
                    .code(200)
                    .message("Upload thành công")
                    .data(Map.of("url", imageUrl))
                    .build());

        } catch (IOException e) {
            log.error("Lỗi upload banner quảng cáo: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Map<String, String>>builder()
                            .code(500).message("Lỗi khi upload ảnh: " + e.getMessage()).build());
        }
    }
    @PostMapping("/review-media")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadReviewMedia(
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.<Map<String, String>>builder()
                        .code(400).message("File trống").build());
            }

            String contentType = file.getContentType();
            boolean isImage = contentType != null && contentType.startsWith("image/");
            boolean isVideo = contentType != null && contentType.startsWith("video/");

            if (!isImage && !isVideo) {
                return ResponseEntity.badRequest().body(ApiResponse.<Map<String, String>>builder()
                        .code(400).message("Chỉ chấp nhận file ảnh hoặc video").build());
            }

            // Limit video size to ~10MB
            if (isVideo && file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(ApiResponse.<Map<String, String>>builder()
                        .code(400).message("Video không được quá 10MB").build());
            }

            Path uploadPath = Paths.get("upload/review-media/");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = UUID.randomUUID().toString() + extension;

            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath);

            String mediaUrl = "/api/upload/review-media/" + newFilename;
            String mediaType = isVideo ? "VIDEO" : "IMAGE";
            log.info("Uploaded review media ({}): {}", mediaType, mediaUrl);

            return ResponseEntity.ok(ApiResponse.<Map<String, String>>builder()
                    .code(200)
                    .message("Upload thành công")
                    .data(Map.of("url", mediaUrl, "loai", mediaType))
                    .build());

        } catch (IOException e) {
            log.error("Lỗi upload review media: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Map<String, String>>builder()
                            .code(500).message("Lỗi khi upload: " + e.getMessage()).build());
        }
    }

    @GetMapping("/review-media/{filename:.+}")
    public ResponseEntity<org.springframework.core.io.Resource> serveReviewMedia(@PathVariable String filename) {
        try {
            Path filePath = Paths.get("upload/review-media/").resolve(filename);
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                return ResponseEntity.ok()
                        .header("Content-Type", contentType != null ? contentType : "application/octet-stream")
                        .body(resource);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
