package com.nexusai.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class NotificationDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationResponse {
        private String id;
        private String title;
        private String message;
        private String type;
        private boolean isRead;
        private String link;
        private LocalDateTime createdAt;
    }
}
