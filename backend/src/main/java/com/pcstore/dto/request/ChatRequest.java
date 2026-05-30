package com.pcstore.dto.request;

import lombok.Data;

@Data
public class ChatRequest {
    private String message;
    private String sessionId;
}
