package com.nexusai.crm.controller;

import com.nexusai.crm.dto.OrganizationDto;
import com.nexusai.crm.security.SecurityUtils;
import com.nexusai.crm.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @GetMapping("/me")
    public ResponseEntity<OrganizationDto.OrganizationResponse> getCurrentOrganization() {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(organizationService.getOrganization(orgId));
    }

    @PutMapping("/me")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<OrganizationDto.OrganizationResponse> updateOrganization(@RequestBody OrganizationDto.UpdateOrgRequest request) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(organizationService.updateOrganization(orgId, request));
    }
}
