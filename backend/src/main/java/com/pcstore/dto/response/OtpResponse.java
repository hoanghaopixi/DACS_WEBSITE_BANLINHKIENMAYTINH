package com.pcstore.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class OtpResponse {
    private String identifier;
    private String otp;
    private String note;
}
