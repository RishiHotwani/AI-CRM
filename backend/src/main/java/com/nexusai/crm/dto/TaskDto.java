package com.nexusai.crm.dto;

import com.nexusai.crm.entity.enums.TaskPriority;
import com.nexusai.crm.entity.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class TaskDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskResponse {
        private String id;
        private String title;
        private String description;
        private LocalDateTime dueDate;
        private TaskPriority priority;
        private TaskStatus status;
        private boolean isOverdue;

        private UserDto.UserResponse assignedTo;
        private UserDto.UserResponse creator;
        private String leadId;
        private String contactId;
        private String companyId;
        private String dealId;

        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateTaskRequest {
        @NotBlank(message = "Title is required")
        private String title;

        private String description;
        private LocalDateTime dueDate;
        private TaskPriority priority;
        private TaskStatus status;
        private String assignedToId;

        private String leadId;
        private String contactId;
        private String companyId;
        private String dealId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateTaskRequest {
        private String title;
        private String description;
        private LocalDateTime dueDate;
        private TaskPriority priority;
        private TaskStatus status;
        private String assignedToId;
    }
}
