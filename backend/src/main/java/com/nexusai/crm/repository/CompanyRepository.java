package com.nexusai.crm.repository;

import com.nexusai.crm.entity.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, String> {

    Optional<Company> findByIdAndOrganizationIdAndDeletedAtIsNull(String id, String organizationId);

    Page<Company> findByOrganizationIdAndDeletedAtIsNull(String organizationId, Pageable pageable);

    @Query("SELECT c FROM Company c WHERE c.organization.id = :orgId AND c.deletedAt IS NULL AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(c.industry) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Company> searchCompanies(String orgId, String query, Pageable pageable);

    Optional<Company> findByOrganizationIdAndNameIgnoreCaseAndDeletedAtIsNull(String orgId, String name);

    List<Company> findByOrganizationIdAndDeletedAtIsNull(String orgId);

    long countByOrganizationIdAndDeletedAtIsNull(String orgId);
}
