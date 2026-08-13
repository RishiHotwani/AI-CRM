package com.nexusai.crm.dto;

import com.nexusai.crm.entity.enums.LeadSource;
import com.nexusai.crm.entity.enums.LeadStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class LeadDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeadResponse {
        private String id;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String companyName;
        private String jobTitle;
        private LeadStatus status;
        private LeadSource source;
        private String industry;
        private String location;
        private int leadScore;
        private String scoreExplanation;
        private LocalDateTime lastContactedAt;
        private LocalDateTime nextFollowUpAt;
        private UserDto.UserResponse assignedTo;
        private String convertedContactId;
        private String convertedCompanyId;
        private String convertedDealId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateLeadRequest {
        @NotBlank(message = "First name is required")
        private String firstName;

        @NotBlank(message = "Last name is required")
        private String lastName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        private String phone;
        private String companyName;
        private String jobTitle;
        private LeadStatus status;
        private LeadSource source;
        private String industry;
        private String location;
        private String assignedToId;
        private LocalDateTime nextFollowUpAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateLeadRequest {
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String companyName;
        private String jobTitle;
        private LeadStatus status;
        private LeadSource source;
        private String industry;
        private String location;
        private String assignedToId;
        private LocalDateTime lastContactedAt;
        private LocalDateTime nextFollowUpAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeadConversionRequest {
        private String dealName;
        private BigDecimal dealValue;
        private String pipelineId;
        private String stageId;
        private String existingCompanyId;
        private String existingContactId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeadConversionResponse {
        private String leadId;
        private String contactId;
        private String companyId;
        private String dealId;
        private String message;
    }
}
