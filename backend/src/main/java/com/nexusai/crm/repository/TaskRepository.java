package com.nexusai.crm.repository;

import com.nexusai.crm.entity.Task;
import com.nexusai.crm.entity.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {

    Optional<Task> findByIdAndOrganizationId(String id, String organizationId);

    Page<Task> findByOrganizationId(String organizationId, Pageable pageable);

    List<Task> findByOrganizationIdAndStatusNot(String orgId, TaskStatus status);

    long countByOrganizationIdAndStatusNotAndDueDateBefore(String orgId, TaskStatus status, LocalDateTime now);

    long countByOrganizationIdAndStatusNot(String orgId, TaskStatus status);
}
