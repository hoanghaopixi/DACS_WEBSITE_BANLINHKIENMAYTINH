package com.pcstore.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyRevenue {
    private String date;
    private BigDecimal amount;
}
