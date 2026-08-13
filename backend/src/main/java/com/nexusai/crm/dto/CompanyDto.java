package com.nexusai.crm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CompanyDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompanyResponse {
        private String id;
        private String name;
        private String website;
        private String industry;
        private Integer employeeCount;
        private BigDecimal annualRevenue;
        private String location;
        private String description;
        private UserDto.UserResponse owner;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateCompanyRequest {
        @NotBlank(message = "Company name is required")
        private String name;

        private String website;
        private String industry;
        private Integer employeeCount;
        private BigDecimal annualRevenue;
        private String location;
        private String description;
        private String ownerId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateCompanyRequest {
        private String name;
        private String website;
        private String industry;
        private Integer employeeCount;
        private BigDecimal annualRevenue;
        private String location;
        private String description;
        private String ownerId;
    }
}
