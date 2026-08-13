package com.nexusai.crm.controller;

import com.nexusai.crm.dto.AuditLogDto;
import com.nexusai.crm.dto.PageResponse;
import com.nexusai.crm.entity.AuditLog;
import com.nexusai.crm.repository.AuditLogRepository;
import com.nexusai.crm.security.SecurityUtils;
import com.nexusai.crm.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;
    private final AuthService authService;

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<PageResponse<AuditLogDto.AuditLogResponse>> getAuditLogs(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        String orgId = SecurityUtils.getCurrentOrgId();
        Page<AuditLog> logs = auditLogRepository.findByOrganizationIdOrderByCreatedAtDesc(orgId, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(PageResponse.from(logs.map(l -> AuditLogDto.AuditLogResponse.builder()
                .id(l.getId())
                .action(l.getAction())
                .entityType(l.getEntityType())
                .entityId(l.getEntityId())
                .detailsJson(l.getDetailsJson())
                .ipAddress(l.getIpAddress())
                .user(l.getUser() != null ? authService.mapUserResponse(l.getUser()) : null)
                .createdAt(l.getCreatedAt())
                .build())));
    }
}
