package com.nexusai.crm.service;

import com.nexusai.crm.dto.OrganizationDto;
import com.nexusai.crm.entity.Organization;
import com.nexusai.crm.exception.ResourceNotFoundException;
import com.nexusai.crm.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final AuthService authService;

    public OrganizationDto.OrganizationResponse getOrganization(String orgId) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        return authService.mapOrgResponse(org);
    }

    @Transactional
    public OrganizationDto.OrganizationResponse updateOrganization(String orgId, OrganizationDto.UpdateOrgRequest request) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        if (request.getName() != null) org.setName(request.getName());
        if (request.getTier() != null) org.setTier(request.getTier());

        return authService.mapOrgResponse(organizationRepository.save(org));
    }
}
