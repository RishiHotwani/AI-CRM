package com.nexusai.crm.service;

import com.nexusai.crm.entity.Organization;
import com.nexusai.crm.entity.Pipeline;
import com.nexusai.crm.entity.PipelineStage;
import com.nexusai.crm.repository.PipelineRepository;
import com.nexusai.crm.repository.PipelineStageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final PipelineRepository pipelineRepository;
    private final PipelineStageRepository pipelineStageRepository;

    @Transactional
    public Pipeline createDefaultPipeline(Organization org) {
        Pipeline pipeline = Pipeline.builder()
                .organization(org)
                .name("Standard Sales Pipeline")
                .isDefault(true)
                .build();
        pipeline = pipelineRepository.save(pipeline);

        List<PipelineStage> defaultStages = List.of(
                PipelineStage.builder().pipeline(pipeline).name("Discovery").stageOrder(1).winProbability(10).build(),
                PipelineStage.builder().pipeline(pipeline).name("Qualification").stageOrder(2).winProbability(30).build(),
                PipelineStage.builder().pipeline(pipeline).name("Proposal").stageOrder(3).winProbability(60).build(),
                PipelineStage.builder().pipeline(pipeline).name("Negotiation").stageOrder(4).winProbability(80).build(),
                PipelineStage.builder().pipeline(pipeline).name("Closed Won").stageOrder(5).winProbability(100).isWonStage(true).build(),
                PipelineStage.builder().pipeline(pipeline).name("Closed Lost").stageOrder(6).winProbability(0).isLostStage(true).build()
        );

        pipelineStageRepository.saveAll(defaultStages);
        return pipeline;
    }
}
