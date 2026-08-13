package com.nexusai.crm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class AiDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiSummaryResponse {
        private String summary;
        private List<String> keyFacts;
        private List<String> recentActivityHighlights;
        private List<String> risks;
        private String recommendedNextAction;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiEmailRequest {
        private String recipientName;
        private String recipientEmail;
        @NotBlank(message = "Purpose is required")
        private String purpose;
        private String tone; // Professional, Friendly, Concise, Persuasive
        private String context;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiEmailResponse {
        private String subject;
        private String body;
        private String toneUsed;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiChatRequest {
        private String conversationId;
        @NotBlank(message = "Message cannot be blank")
        private String message;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiChatResponse {
        private String conversationId;
        private String message;
        private List<String> citations;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiRiskResponse {
        private String dealId;
        private String dealRiskLevel; // LOW, MEDIUM, HIGH
        private String riskExplanation;
        private List<String> riskFactors;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiNextActionResponse {
        private String entityId;
        private String entityType;
        private String recommendedAction;
        private String reasoning;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiForecastResponse {
        private String period;
        private double actualRevenue;
        private double forecastedRevenue;
        private double confidenceScore;
        private String reasoning;
    }
}
