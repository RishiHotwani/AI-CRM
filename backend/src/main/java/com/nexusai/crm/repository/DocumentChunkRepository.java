package com.nexusai.crm.repository;

import com.nexusai.crm.entity.DocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, String> {
    List<DocumentChunk> findByDocumentId(String documentId);
    List<DocumentChunk> findByOrganizationId(String organizationId);
    void deleteByDocumentId(String documentId);
}
