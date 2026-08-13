package com.nexusai.crm.service;

import com.nexusai.crm.dto.CompanyDto;
import com.nexusai.crm.dto.PageResponse;
import com.nexusai.crm.entity.Company;
import com.nexusai.crm.entity.Organization;
import com.nexusai.crm.entity.User;
import com.nexusai.crm.exception.BadRequestException;
import com.nexusai.crm.exception.ResourceNotFoundException;
import com.nexusai.crm.repository.CompanyRepository;
import com.nexusai.crm.repository.OrganizationRepository;
import com.nexusai.crm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final AuditService auditService;

    public PageResponse<CompanyDto.CompanyResponse> getCompanies(String orgId, String query, Pageable pageable) {
        Page<Company> page;
        if (query != null && !query.isBlank()) {
            page = companyRepository.searchCompanies(orgId, query.trim(), pageable);
        } else {
            page = companyRepository.findByOrganizationIdAndDeletedAtIsNull(orgId, pageable);
        }
        return PageResponse.from(page.map(this::mapToResponse));
    }

    public CompanyDto.CompanyResponse getCompany(String orgId, String companyId) {
        Company company = companyRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(companyId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        return mapToResponse(company);
    }

    @Transactional
    public CompanyDto.CompanyResponse createCompany(String orgId, CompanyDto.CreateCompanyRequest request) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        if (companyRepository.findByOrganizationIdAndNameIgnoreCaseAndDeletedAtIsNull(orgId, request.getName()).isPresent()) {
            throw new BadRequestException("A company named " + request.getName() + " already exists in your workspace.");
        }

        User owner = null;
        if (request.getOwnerId() != null) {
            owner = userRepository.findByIdAndOrganizationId(request.getOwnerId(), orgId).orElse(null);
        }

        Company company = Company.builder()
                .organization(org)
                .name(request.getName())
                .website(request.getWebsite())
                .industry(request.getIndustry())
                .employeeCount(request.getEmployeeCount())
                .annualRevenue(request.getAnnualRevenue())
                .location(request.getLocation())
                .description(request.getDescription())
                .owner(owner)
                .build();

        company = companyRepository.save(company);
        auditService.logAction("CREATE_COMPANY", "Company", company.getId(), "Created company " + company.getName());
        return mapToResponse(company);
    }

    @Transactional
    public CompanyDto.CompanyResponse updateCompany(String orgId, String companyId, CompanyDto.UpdateCompanyRequest request) {
        Company company = companyRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(companyId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        if (request.getName() != null) company.setName(request.getName());
        if (request.getWebsite() != null) company.setWebsite(request.getWebsite());
        if (request.getIndustry() != null) company.setIndustry(request.getIndustry());
        if (request.getEmployeeCount() != null) company.setEmployeeCount(request.getEmployeeCount());
        if (request.getAnnualRevenue() != null) company.setAnnualRevenue(request.getAnnualRevenue());
        if (request.getLocation() != null) company.setLocation(request.getLocation());
        if (request.getDescription() != null) company.setDescription(request.getDescription());

        if (request.getOwnerId() != null) {
            User owner = userRepository.findByIdAndOrganizationId(request.getOwnerId(), orgId).orElse(null);
            company.setOwner(owner);
        }

        company = companyRepository.save(company);
        auditService.logAction("UPDATE_COMPANY", "Company", company.getId(), "Updated company details");
        return mapToResponse(company);
    }

    @Transactional
    public void deleteCompany(String orgId, String companyId) {
        Company company = companyRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(companyId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        company.setDeletedAt(LocalDateTime.now());
        companyRepository.save(company);
        auditService.logAction("DELETE_COMPANY", "Company", companyId, "Soft deleted company");
    }

    public CompanyDto.CompanyResponse mapToResponse(Company c) {
        return CompanyDto.CompanyResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .website(c.getWebsite())
                .industry(c.getIndustry())
                .employeeCount(c.getEmployeeCount())
                .annualRevenue(c.getAnnualRevenue())
                .location(c.getLocation())
                .description(c.getDescription())
                .owner(c.getOwner() != null ? authService.mapUserResponse(c.getOwner()) : null)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
