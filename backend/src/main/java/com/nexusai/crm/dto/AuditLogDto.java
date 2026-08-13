package com.nexusai.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class AuditLogDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuditLogResponse {
        private String id;
        private String action;
        private String entityType;
        private String entityId;
        private String detailsJson;
        private String ipAddress;
        private UserDto.UserResponse user;
        private LocalDateTime createdAt;
    }
}
