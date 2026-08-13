package com.nexusai.crm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class MeetingDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MeetingResponse {
        private String id;
        private String title;
        private String description;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String location;
        private String meetingLink;
        private String transcript;
        private String aiSummary;
        private List<String> actionItems;

        private UserDto.UserResponse organizer;
        private ContactDto.ContactResponse contact;
        private CompanyDto.CompanyResponse company;
        private DealDto.DealResponse deal;

        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateMeetingRequest {
        @NotBlank(message = "Title is required")
        private String title;

        private String description;

        @NotNull(message = "Start time is required")
        private LocalDateTime startTime;

        @NotNull(message = "End time is required")
        private LocalDateTime endTime;

        private String location;
        private String meetingLink;
        private String transcript;

        private String contactId;
        private String companyId;
        private String dealId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MeetingSummaryRequest {
        @NotBlank(message = "Transcript is required")
        private String transcript;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MeetingSummaryResponse {
        private String summary;
        private List<String> keyDiscussionPoints;
        private List<String> actionItems;
        private String followUpEmailDraft;
    }
}
