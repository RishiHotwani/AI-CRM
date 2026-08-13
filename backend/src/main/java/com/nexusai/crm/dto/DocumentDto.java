package com.nexusai.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class DocumentDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentResponse {
        private String id;
        private String title;
        private String fileName;
        private String fileType;
        private long fileSize;
        private boolean vectorIndexed;
        private UserDto.UserResponse uploadedBy;
        private LocalDateTime createdAt;
    }
}
