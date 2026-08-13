package com.nexusai.crm.repository;

import com.nexusai.crm.entity.Activity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, String> {

    List<Activity> findByOrganizationIdAndLeadIdOrderByCreatedAtDesc(String orgId, String leadId);
    List<Activity> findByOrganizationIdAndContactIdOrderByCreatedAtDesc(String orgId, String contactId);
    List<Activity> findByOrganizationIdAndCompanyIdOrderByCreatedAtDesc(String orgId, String companyId);
    List<Activity> findByOrganizationIdAndDealIdOrderByCreatedAtDesc(String orgId, String dealId);

    Page<Activity> findByOrganizationIdOrderByCreatedAtDesc(String orgId, Pageable pageable);
}
