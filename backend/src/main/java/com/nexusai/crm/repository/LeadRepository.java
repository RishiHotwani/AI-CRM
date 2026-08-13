package com.nexusai.crm.repository;

import com.nexusai.crm.entity.Lead;
import com.nexusai.crm.entity.enums.LeadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeadRepository extends JpaRepository<Lead, String> {

    Optional<Lead> findByIdAndOrganizationIdAndDeletedAtIsNull(String id, String organizationId);

    Page<Lead> findByOrganizationIdAndDeletedAtIsNull(String organizationId, Pageable pageable);

    Page<Lead> findByOrganizationIdAndStatusAndDeletedAtIsNull(String organizationId, LeadStatus status, Pageable pageable);

    @Query("SELECT l FROM Lead l WHERE l.organization.id = :orgId AND l.deletedAt IS NULL AND " +
           "(LOWER(l.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(l.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(l.email) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(l.companyName) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Lead> searchLeads(String orgId, String query, Pageable pageable);

    Optional<Lead> findByOrganizationIdAndEmailIgnoreCaseAndDeletedAtIsNull(String orgId, String email);

    long countByOrganizationIdAndDeletedAtIsNull(String orgId);

    long countByOrganizationIdAndStatusAndDeletedAtIsNull(String orgId, LeadStatus status);

    List<Lead> findByOrganizationIdAndDeletedAtIsNull(String orgId);
}
