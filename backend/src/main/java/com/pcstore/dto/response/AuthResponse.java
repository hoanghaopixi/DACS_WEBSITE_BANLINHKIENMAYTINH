package com.pcstore.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class AuthResponse {
    private Long maTK;
    private Long maKH;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String anhDaiDien;
    private String provider;
    private Boolean active;
    private List<String> roles;
    private String accessToken;
    @Builder.Default
    private String tokenType = "Bearer";
}
