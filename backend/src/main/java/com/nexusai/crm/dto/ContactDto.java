package com.nexusai.crm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class ContactDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContactResponse {
        private String id;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String jobTitle;
        private String linkedinUrl;
        private String location;
        private String tags;
        private CompanySummary company;
        private UserDto.UserResponse owner;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompanySummary {
        private String id;
        private String name;
        private String website;
        private String industry;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateContactRequest {
        @NotBlank(message = "First name is required")
        private String firstName;

        @NotBlank(message = "Last name is required")
        private String lastName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        private String phone;
        private String jobTitle;
        private String companyId;
        private String ownerId;
        private String linkedinUrl;
        private String location;
        private String tags;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateContactRequest {
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String jobTitle;
        private String companyId;
        private String ownerId;
        private String linkedinUrl;
        private String location;
        private String tags;
    }
}
