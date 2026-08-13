package com.nexusai.crm.repository;

import com.nexusai.crm.entity.Pipeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PipelineRepository extends JpaRepository<Pipeline, String> {
    List<Pipeline> findByOrganizationId(String organizationId);
    Optional<Pipeline> findByIdAndOrganizationId(String id, String organizationId);
    Optional<Pipeline> findByOrganizationIdAndIsDefaultTrue(String organizationId);
}
