package com.pcstore.service;

import com.pcstore.dto.response.DashboardStatsResponse;
import java.util.Map;

public interface StatisticsService {
    DashboardStatsResponse getDashboardStats();
    Map<String, Object> getAdvancedStats(String type, int limit);
}
