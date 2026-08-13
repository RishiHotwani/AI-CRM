package com.nexusai.crm.dto;

import com.nexusai.crm.entity.enums.Tier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class OrganizationDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrganizationResponse {
        private String id;
        private String name;
        private String slug;
        private Tier tier;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateOrgRequest {
        private String name;
        private Tier tier;
    }
}
