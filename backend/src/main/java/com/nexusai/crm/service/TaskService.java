package com.nexusai.crm.service;

import com.nexusai.crm.dto.PageResponse;
import com.nexusai.crm.dto.TaskDto;
import com.nexusai.crm.entity.*;
import com.nexusai.crm.entity.enums.TaskPriority;
import com.nexusai.crm.entity.enums.TaskStatus;
import com.nexusai.crm.exception.ResourceNotFoundException;
import com.nexusai.crm.repository.*;
import com.nexusai.crm.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final LeadRepository leadRepository;
    private final ContactRepository contactRepository;
    private final CompanyRepository companyRepository;
    private final DealRepository dealRepository;
    private final AuthService authService;

    public PageResponse<TaskDto.TaskResponse> getTasks(String orgId, Pageable pageable) {
        Page<Task> page = taskRepository.findByOrganizationId(orgId, pageable);
        return PageResponse.from(page.map(this::mapToResponse));
    }

    public TaskDto.TaskResponse getTask(String orgId, String taskId) {
        Task task = taskRepository.findByIdAndOrganizationId(taskId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        return mapToResponse(task);
    }

    @Transactional
    public TaskDto.TaskResponse createTask(String orgId, TaskDto.CreateTaskRequest request) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        User creator = SecurityUtils.getAuthenticatedUser();

        User assignedTo = null;
        if (request.getAssignedToId() != null) {
            assignedTo = userRepository.findByIdAndOrganizationId(request.getAssignedToId(), orgId).orElse(creator);
        } else {
            assignedTo = creator;
        }

        Lead lead = request.getLeadId() != null ? leadRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(request.getLeadId(), orgId).orElse(null) : null;
        Contact contact = request.getContactId() != null ? contactRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(request.getContactId(), orgId).orElse(null) : null;
        Company company = request.getCompanyId() != null ? companyRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(request.getCompanyId(), orgId).orElse(null) : null;
        Deal deal = request.getDealId() != null ? dealRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(request.getDealId(), orgId).orElse(null) : null;

        Task task = Task.builder()
                .organization(org)
                .creator(creator)
                .assignedTo(assignedTo)
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM)
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
                .lead(lead)
                .contact(contact)
                .company(company)
                .deal(deal)
                .build();

        return mapToResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskDto.TaskResponse updateTask(String orgId, String taskId, TaskDto.UpdateTaskRequest request) {
        Task task = taskRepository.findByIdAndOrganizationId(taskId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getStatus() != null) task.setStatus(request.getStatus());

        if (request.getAssignedToId() != null) {
            User assignedTo = userRepository.findByIdAndOrganizationId(request.getAssignedToId(), orgId).orElse(null);
            task.setAssignedTo(assignedTo);
        }

        return mapToResponse(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(String orgId, String taskId) {
        Task task = taskRepository.findByIdAndOrganizationId(taskId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        taskRepository.delete(task);
    }

    public TaskDto.TaskResponse mapToResponse(Task t) {
        boolean isOverdue = t.getDueDate() != null && t.getDueDate().isBefore(LocalDateTime.now()) && t.getStatus() != TaskStatus.COMPLETED;

        return TaskDto.TaskResponse.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .dueDate(t.getDueDate())
                .priority(t.getPriority())
                .status(t.getStatus())
                .isOverdue(isOverdue)
                .assignedTo(t.getAssignedTo() != null ? authService.mapUserResponse(t.getAssignedTo()) : null)
                .creator(authService.mapUserResponse(t.getCreator()))
                .leadId(t.getLead() != null ? t.getLead().getId() : null)
                .contactId(t.getContact() != null ? t.getContact().getId() : null)
                .companyId(t.getCompany() != null ? t.getCompany().getId() : null)
                .dealId(t.getDeal() != null ? t.getDeal().getId() : null)
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
