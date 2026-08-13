package com.nexusai.crm.controller;

import com.nexusai.crm.dto.DealDto;
import com.nexusai.crm.dto.PageResponse;
import com.nexusai.crm.security.SecurityUtils;
import com.nexusai.crm.service.DealService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/deals")
@RequiredArgsConstructor
public class DealController {

    private final DealService dealService;

    @GetMapping
    public ResponseEntity<PageResponse<DealDto.DealResponse>> getDeals(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(dealService.getDeals(orgId, query, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/pipeline/{pipelineId}")
    public ResponseEntity<List<DealDto.DealResponse>> getDealsByPipeline(@PathVariable("pipelineId") String pipelineId) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(dealService.getDealsByPipeline(orgId, pipelineId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DealDto.DealResponse> getDeal(@PathVariable("id") String id) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(dealService.getDeal(orgId, id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'SALES_MANAGER', 'SALES_REP')")
    public ResponseEntity<DealDto.DealResponse> createDeal(@Valid @RequestBody DealDto.CreateDealRequest request) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.status(HttpStatus.CREATED).body(dealService.createDeal(orgId, request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'SALES_MANAGER', 'SALES_REP')")
    public ResponseEntity<DealDto.DealResponse> updateDeal(
            @PathVariable("id") String id,
            @RequestBody DealDto.UpdateDealRequest request) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(dealService.updateDeal(orgId, id, request));
    }

    @PatchMapping("/{id}/stage")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'SALES_MANAGER', 'SALES_REP')")
    public ResponseEntity<DealDto.DealResponse> moveDealStage(
            @PathVariable("id") String id,
            @Valid @RequestBody DealDto.MoveDealStageRequest request) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(dealService.moveDealStage(orgId, id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'SALES_MANAGER')")
    public ResponseEntity<Void> deleteDeal(@PathVariable("id") String id) {
        String orgId = SecurityUtils.getCurrentOrgId();
        dealService.deleteDeal(orgId, id);
        return ResponseEntity.noContent().build();
    }
}
