package com.pcstore.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private static final String USERNAME_REGEX = "^[a-zA-Z0-9._]{4,20}$";
    private static final String PASSWORD_REGEX = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&._-])[A-Za-z\\d@$!%*?&._-]{8,32}$";
    private static final String PHONE_REGEX = "^(0|\\+84)[3-9][0-9]{8}$";

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(min = 2, max = 100, message = "Họ và tên phải dài từ 2 đến 100 ký tự")
    private String fullName;

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Pattern(regexp = USERNAME_REGEX, message = "Tên đăng nhập phải dài 4-20 ký tự và chỉ gồm chữ, số, dấu chấm hoặc gạch dưới")
    private String username;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = PHONE_REGEX, message = "Số điện thoại phải đúng định dạng Việt Nam")
    private String phone;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Pattern(regexp = PASSWORD_REGEX, message = "Mật khẩu phải dài 8-32 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt")
    private String password;
}
