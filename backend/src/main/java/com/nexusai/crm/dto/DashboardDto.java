package com.nexusai.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

public class DashboardDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStatsResponse {
        private long totalLeads;
        private long qualifiedLeads;
        private long openDeals;
        private BigDecimal pipelineValue;
        private BigDecimal wonRevenue;
        private double conversionRate;
        private BigDecimal avgDealSize;
        private double winRate;
        private double avgSalesCycleDays;
        private long tasksDue;
        private long upcomingMeetings;

        private List<ChartDataPoint> revenueOverTime;
        private List<ChartDataPoint> leadsBySource;
        private List<PipelineStageFunnel> dealPipelineFunnel;
        private List<ChartDataPoint> winLossRatio;
        private List<SalespersonPerformance> teamPerformance;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChartDataPoint {
        private String label;
        private double value;
        private String category;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PipelineStageFunnel {
        private String stageId;
        private String stageName;
        private int dealCount;
        private BigDecimal totalValue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalespersonPerformance {
        private String userId;
        private String name;
        private long dealsWon;
        private BigDecimal revenueGenerated;
        private long leadsAssigned;
    }
}
