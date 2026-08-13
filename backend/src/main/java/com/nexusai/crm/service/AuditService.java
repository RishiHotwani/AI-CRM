package com.nexusai.crm.service;

import com.nexusai.crm.entity.AuditLog;
import com.nexusai.crm.entity.Organization;
import com.nexusai.crm.entity.User;
import com.nexusai.crm.repository.AuditLogRepository;
import com.nexusai.crm.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void logAction(String action, String entityType, String entityId, String detailsJson) {
        try {
            User user = SecurityUtils.getAuthenticatedUser();
            Organization org = user.getOrganization();

            AuditLog logEntry = AuditLog.builder()
                    .organization(org)
                    .user(user)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .detailsJson(detailsJson)
                    .build();

            auditLogRepository.save(logEntry);
        } catch (Exception e) {
            log.warn("Could not record audit log: {}", e.getMessage());
        }
    }
}
