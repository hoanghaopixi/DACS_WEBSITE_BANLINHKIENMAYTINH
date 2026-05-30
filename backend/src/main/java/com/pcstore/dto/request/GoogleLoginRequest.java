package com.pcstore.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GoogleLoginRequest {
    @NotBlank(message = "Email Google không được để trống")
    @Email(message = "Email Google không đúng định dạng")
    private String email;
}
