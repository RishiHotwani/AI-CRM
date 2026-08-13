package com.nexusai.crm.controller;

import com.nexusai.crm.dto.LeadDto;
import com.nexusai.crm.dto.PageResponse;
import com.nexusai.crm.entity.enums.LeadStatus;
import com.nexusai.crm.security.SecurityUtils;
import com.nexusai.crm.service.LeadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/leads")
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;

    @GetMapping
    public ResponseEntity<PageResponse<LeadDto.LeadResponse>> getLeads(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "status", required = false) LeadStatus status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(leadService.getLeads(orgId, query, status, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeadDto.LeadResponse> getLead(@PathVariable("id") String id) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(leadService.getLead(orgId, id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'SALES_MANAGER', 'SALES_REP')")
    public ResponseEntity<LeadDto.LeadResponse> createLead(@Valid @RequestBody LeadDto.CreateLeadRequest request) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.status(HttpStatus.CREATED).body(leadService.createLead(orgId, request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'SALES_MANAGER', 'SALES_REP')")
    public ResponseEntity<LeadDto.LeadResponse> updateLead(
            @PathVariable("id") String id,
            @RequestBody LeadDto.UpdateLeadRequest request) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(leadService.updateLead(orgId, id, request));
    }

    @PostMapping("/{id}/convert")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'SALES_MANAGER', 'SALES_REP')")
    public ResponseEntity<LeadDto.LeadConversionResponse> convertLead(
            @PathVariable("id") String id,
            @RequestBody LeadDto.LeadConversionRequest request) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(leadService.convertLead(orgId, id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'SALES_MANAGER')")
    public ResponseEntity<Void> deleteLead(@PathVariable("id") String id) {
        String orgId = SecurityUtils.getCurrentOrgId();
        leadService.deleteLead(orgId, id);
        return ResponseEntity.noContent().build();
    }
}
