package com.nexusai.crm.dto;

import com.nexusai.crm.entity.enums.ActivityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class ActivityDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityResponse {
        private String id;
        private ActivityType type;
        private String title;
        private String description;
        private UserDto.UserResponse user;
        private String leadId;
        private String contactId;
        private String companyId;
        private String dealId;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateActivityRequest {
        @NotNull(message = "Activity type is required")
        private ActivityType type;

        @NotBlank(message = "Title is required")
        private String title;

        private String description;
        private String leadId;
        private String contactId;
        private String companyId;
        private String dealId;
    }
}
