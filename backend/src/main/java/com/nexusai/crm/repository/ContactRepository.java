package com.nexusai.crm.repository;

import com.nexusai.crm.entity.Contact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContactRepository extends JpaRepository<Contact, String> {

    Optional<Contact> findByIdAndOrganizationIdAndDeletedAtIsNull(String id, String organizationId);

    Page<Contact> findByOrganizationIdAndDeletedAtIsNull(String organizationId, Pageable pageable);

    List<Contact> findByOrganizationIdAndCompanyIdAndDeletedAtIsNull(String organizationId, String companyId);

    @Query("SELECT c FROM Contact c WHERE c.organization.id = :orgId AND c.deletedAt IS NULL AND " +
           "(LOWER(c.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(c.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Contact> searchContacts(String orgId, String query, Pageable pageable);

    Optional<Contact> findByOrganizationIdAndEmailIgnoreCaseAndDeletedAtIsNull(String orgId, String email);

    long countByOrganizationIdAndDeletedAtIsNull(String orgId);
}
