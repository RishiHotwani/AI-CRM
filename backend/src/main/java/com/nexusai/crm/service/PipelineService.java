package com.nexusai.crm.service;

import com.nexusai.crm.dto.PipelineDto;
import com.nexusai.crm.entity.Organization;
import com.nexusai.crm.entity.Pipeline;
import com.nexusai.crm.entity.PipelineStage;
import com.nexusai.crm.exception.ResourceNotFoundException;
import com.nexusai.crm.repository.OrganizationRepository;
import com.nexusai.crm.repository.PipelineRepository;
import com.nexusai.crm.repository.PipelineStageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PipelineService {

    private final PipelineRepository pipelineRepository;
    private final PipelineStageRepository pipelineStageRepository;
    private final OrganizationRepository organizationRepository;

    public List<PipelineDto.PipelineResponse> getPipelines(String orgId) {
        return pipelineRepository.findByOrganizationId(orgId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public PipelineDto.PipelineResponse getPipeline(String orgId, String pipelineId) {
        Pipeline pipeline = pipelineRepository.findByIdAndOrganizationId(pipelineId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found"));
        return mapToResponse(pipeline);
    }

    @Transactional
    public PipelineDto.PipelineResponse createPipeline(String orgId, PipelineDto.CreatePipelineRequest request) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        Pipeline pipeline = Pipeline.builder()
                .organization(org)
                .name(request.getName())
                .isDefault(request.isDefault())
                .build();

        pipeline = pipelineRepository.save(pipeline);

        if (request.getStages() != null && !request.getStages().isEmpty()) {
            Pipeline finalPipeline = pipeline;
            List<PipelineStage> stages = request.getStages().stream().map(s -> PipelineStage.builder()
                    .pipeline(finalPipeline)
                    .name(s.getName())
                    .stageOrder(s.getStageOrder())
                    .winProbability(s.getWinProbability())
                    .isWonStage(s.isWonStage())
                    .isLostStage(s.isLostStage())
                    .build()).toList();
            pipelineStageRepository.saveAll(stages);
        }

        return mapToResponse(pipelineRepository.findById(pipeline.getId()).orElse(pipeline));
    }

    public PipelineDto.PipelineResponse mapToResponse(Pipeline p) {
        List<PipelineDto.PipelineStageResponse> stages = pipelineStageRepository.findByPipelineIdOrderByStageOrderAsc(p.getId())
                .stream().map(s -> PipelineDto.PipelineStageResponse.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .stageOrder(s.getStageOrder())
                        .winProbability(s.getWinProbability())
                        .isWonStage(s.isWonStage())
                        .isLostStage(s.isLostStage())
                        .build()).toList();

        return PipelineDto.PipelineResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .isDefault(p.isDefault())
                .stages(stages)
                .createdAt(p.getCreatedAt())
                .build();
    }
}
