package com.nexusai.crm.repository;

import com.nexusai.crm.entity.PipelineStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PipelineStageRepository extends JpaRepository<PipelineStage, String> {
    List<PipelineStage> findByPipelineIdOrderByStageOrderAsc(String pipelineId);
    Optional<PipelineStage> findByIdAndPipelineOrganizationId(String id, String organizationId);
}
