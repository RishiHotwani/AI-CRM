package com.nexusai.crm.repository;

import com.nexusai.crm.entity.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, String> {
    Optional<Document> findByIdAndOrganizationId(String id, String organizationId);
    Page<Document> findByOrganizationIdOrderByCreatedAtDesc(String organizationId, Pageable pageable);
    List<Document> findByOrganizationId(String organizationId);
}
