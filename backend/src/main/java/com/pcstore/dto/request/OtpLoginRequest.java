package com.pcstore.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OtpLoginRequest {
    @NotBlank(message = "Username hoặc số điện thoại không được để trống")
    private String identifier;

    @NotBlank(message = "OTP không được để trống")
    private String otp;
}
