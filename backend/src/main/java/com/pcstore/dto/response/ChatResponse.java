package com.pcstore.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ChatResponse {
    private String replyText;
    private List<SuggestedProduct> suggestedProducts;
    private String sessionId;

    @Data
    public static class SuggestedProduct {
        private Long productId;
        private String name;
        private BigDecimal price;
        private String image;
    }
}
