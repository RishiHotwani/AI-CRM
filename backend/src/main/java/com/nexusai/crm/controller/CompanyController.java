package com.nexusai.crm.controller;

import com.nexusai.crm.dto.CompanyDto;
import com.nexusai.crm.dto.PageResponse;
import com.nexusai.crm.security.SecurityUtils;
import com.nexusai.crm.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public ResponseEntity<PageResponse<CompanyDto.CompanyResponse>> getCompanies(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(companyService.getCompanies(orgId, query, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyDto.CompanyResponse> getCompany(@PathVariable("id") String id) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(companyService.getCompany(orgId, id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'SALES_MANAGER', 'SALES_REP')")
    public ResponseEntity<CompanyDto.CompanyResponse> createCompany(@Valid @RequestBody CompanyDto.CreateCompanyRequest request) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.status(HttpStatus.CREATED).body(companyService.createCompany(orgId, request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'SALES_MANAGER', 'SALES_REP')")
    public ResponseEntity<CompanyDto.CompanyResponse> updateCompany(
            @PathVariable("id") String id,
            @RequestBody CompanyDto.UpdateCompanyRequest request) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(companyService.updateCompany(orgId, id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'SALES_MANAGER')")
    public ResponseEntity<Void> deleteCompany(@PathVariable("id") String id) {
        String orgId = SecurityUtils.getCurrentOrgId();
        companyService.deleteCompany(orgId, id);
        return ResponseEntity.noContent().build();
    }
}
