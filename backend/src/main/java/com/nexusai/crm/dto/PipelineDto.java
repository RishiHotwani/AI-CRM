package com.nexusai.crm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class PipelineDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PipelineResponse {
        private String id;
        private String name;
        private boolean isDefault;
        private List<PipelineStageResponse> stages;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PipelineStageResponse {
        private String id;
        private String name;
        private int stageOrder;
        private int winProbability;
        private boolean isWonStage;
        private boolean isLostStage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatePipelineRequest {
        @NotBlank(message = "Pipeline name is required")
        private String name;

        private boolean isDefault;
        private List<CreateStageRequest> stages;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateStageRequest {
        @NotBlank(message = "Stage name is required")
        private String name;

        private int stageOrder;
        private int winProbability;
        private boolean isWonStage;
        private boolean isLostStage;
    }
}
