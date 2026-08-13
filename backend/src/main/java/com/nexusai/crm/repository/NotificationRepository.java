package com.nexusai.crm.repository;

import com.nexusai.crm.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByOrganizationIdAndUserIdAndIsReadFalseOrderByCreatedAtDesc(String orgId, String userId);
    Page<Notification> findByOrganizationIdAndUserIdOrderByCreatedAtDesc(String orgId, String userId, Pageable pageable);
    long countByOrganizationIdAndUserIdAndIsReadFalse(String orgId, String userId);
}
