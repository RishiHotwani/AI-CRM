package com.nexusai.crm.repository;

import com.nexusai.crm.entity.Meeting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, String> {

    Optional<Meeting> findByIdAndOrganizationId(String id, String organizationId);

    Page<Meeting> findByOrganizationIdOrderByStartTimeDesc(String organizationId, Pageable pageable);

    List<Meeting> findByOrganizationIdAndStartTimeBetweenOrderByStartTimeAsc(String orgId, LocalDateTime start, LocalDateTime end);

    long countByOrganizationIdAndStartTimeAfter(String orgId, LocalDateTime now);
}
