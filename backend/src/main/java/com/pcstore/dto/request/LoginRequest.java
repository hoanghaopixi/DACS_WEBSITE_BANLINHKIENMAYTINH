package com.pcstore.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    private static final String USERNAME_REGEX = "^[a-zA-Z0-9._]{4,20}$";
    private static final String PASSWORD_REGEX = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&._-])[A-Za-z\\d@$!%*?&._-]{8,32}$";

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Pattern(regexp = USERNAME_REGEX, message = "Tên đăng nhập phải dài 4-20 ký tự và chỉ gồm chữ, số, dấu chấm hoặc gạch dưới")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Pattern(regexp = PASSWORD_REGEX, message = "Mật khẩu phải dài 8-32 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt")
    private String password;
}
