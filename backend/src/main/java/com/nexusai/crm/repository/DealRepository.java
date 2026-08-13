package com.nexusai.crm.repository;

import com.nexusai.crm.entity.Deal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface DealRepository extends JpaRepository<Deal, String> {

    Optional<Deal> findByIdAndOrganizationIdAndDeletedAtIsNull(String id, String organizationId);

    Page<Deal> findByOrganizationIdAndDeletedAtIsNull(String organizationId, Pageable pageable);

    List<Deal> findByOrganizationIdAndPipelineIdAndDeletedAtIsNull(String organizationId, String pipelineId);

    List<Deal> findByOrganizationIdAndCompanyIdAndDeletedAtIsNull(String organizationId, String companyId);

    List<Deal> findByOrganizationIdAndContactIdAndDeletedAtIsNull(String organizationId, String contactId);

    @Query("SELECT d FROM Deal d WHERE d.organization.id = :orgId AND d.deletedAt IS NULL AND " +
           "(LOWER(d.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Deal> searchDeals(String orgId, String query, Pageable pageable);

    long countByOrganizationIdAndDeletedAtIsNull(String orgId);

    @Query("SELECT SUM(d.value) FROM Deal d WHERE d.organization.id = :orgId AND d.deletedAt IS NULL AND d.stage.isWonStage = false AND d.stage.isLostStage = false")
    BigDecimal calculatePipelineValue(String orgId);

    @Query("SELECT SUM(d.value) FROM Deal d WHERE d.organization.id = :orgId AND d.deletedAt IS NULL AND d.stage.isWonStage = true")
    BigDecimal calculateWonRevenue(String orgId);

    List<Deal> findByOrganizationIdAndDeletedAtIsNull(String orgId);
}
