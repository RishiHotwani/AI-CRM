package com.nexusai.crm.dto;

import com.nexusai.crm.entity.enums.RiskLevel;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class DealDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DealResponse {
        private String id;
        private String name;
        private BigDecimal value;
        private String currency;
        private int probability;
        private LocalDate expectedCloseDate;
        private LocalDateTime actualCloseDate;
        private String lostReason;
        private RiskLevel dealRiskLevel;
        private String riskExplanation;
        private String description;

        private PipelineDto.PipelineStageResponse stage;
        private String pipelineId;
        private CompanyDto.CompanyResponse company;
        private ContactDto.ContactResponse contact;
        private UserDto.UserResponse owner;

        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateDealRequest {
        @NotBlank(message = "Deal name is required")
        private String name;

        private BigDecimal value;
        private String currency;
        private String pipelineId;

        @NotBlank(message = "Stage ID is required")
        private String stageId;

        private String companyId;
        private String contactId;
        private String ownerId;
        private LocalDate expectedCloseDate;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateDealRequest {
        private String name;
        private BigDecimal value;
        private String currency;
        private String stageId;
        private String companyId;
        private String contactId;
        private String ownerId;
        private LocalDate expectedCloseDate;
        private String lostReason;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MoveDealStageRequest {
        @NotBlank(message = "Target Stage ID is required")
        private String stageId;

        private String lostReason;
    }
}
