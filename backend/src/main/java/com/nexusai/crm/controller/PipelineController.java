package com.nexusai.crm.controller;

import com.nexusai.crm.dto.PipelineDto;
import com.nexusai.crm.security.SecurityUtils;
import com.nexusai.crm.service.PipelineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pipelines")
@RequiredArgsConstructor
public class PipelineController {

    private final PipelineService pipelineService;

    @GetMapping
    public ResponseEntity<List<PipelineDto.PipelineResponse>> getPipelines() {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(pipelineService.getPipelines(orgId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PipelineDto.PipelineResponse> getPipeline(@PathVariable("id") String id) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(pipelineService.getPipeline(orgId, id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<PipelineDto.PipelineResponse> createPipeline(@Valid @RequestBody PipelineDto.CreatePipelineRequest request) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.status(HttpStatus.CREATED).body(pipelineService.createPipeline(orgId, request));
    }
}
