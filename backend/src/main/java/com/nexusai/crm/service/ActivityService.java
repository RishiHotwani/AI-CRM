package com.nexusai.crm.service;

import com.nexusai.crm.dto.ActivityDto;
import com.nexusai.crm.dto.PageResponse;
import com.nexusai.crm.entity.*;
import com.nexusai.crm.exception.ResourceNotFoundException;
import com.nexusai.crm.repository.*;
import com.nexusai.crm.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final OrganizationRepository organizationRepository;
    private final LeadRepository leadRepository;
    private final ContactRepository contactRepository;
    private final CompanyRepository companyRepository;
    private final DealRepository dealRepository;
    private final AuthService authService;

    public PageResponse<ActivityDto.ActivityResponse> getActivities(String orgId, Pageable pageable) {
        Page<Activity> page = activityRepository.findByOrganizationIdOrderByCreatedAtDesc(orgId, pageable);
        return PageResponse.from(page.map(this::mapToResponse));
    }

    public List<ActivityDto.ActivityResponse> getActivitiesForLead(String orgId, String leadId) {
        return activityRepository.findByOrganizationIdAndLeadIdOrderByCreatedAtDesc(orgId, leadId)
                .stream().map(this::mapToResponse).toList();
    }

    public List<ActivityDto.ActivityResponse> getActivitiesForContact(String orgId, String contactId) {
        return activityRepository.findByOrganizationIdAndContactIdOrderByCreatedAtDesc(orgId, contactId)
                .stream().map(this::mapToResponse).toList();
    }

    public List<ActivityDto.ActivityResponse> getActivitiesForCompany(String orgId, String companyId) {
        return activityRepository.findByOrganizationIdAndCompanyIdOrderByCreatedAtDesc(orgId, companyId)
                .stream().map(this::mapToResponse).toList();
    }

    public List<ActivityDto.ActivityResponse> getActivitiesForDeal(String orgId, String dealId) {
        return activityRepository.findByOrganizationIdAndDealIdOrderByCreatedAtDesc(orgId, dealId)
                .stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public ActivityDto.ActivityResponse createActivity(String orgId, ActivityDto.CreateActivityRequest request) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        User user = SecurityUtils.getAuthenticatedUser();

        Lead lead = request.getLeadId() != null ? leadRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(request.getLeadId(), orgId).orElse(null) : null;
        Contact contact = request.getContactId() != null ? contactRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(request.getContactId(), orgId).orElse(null) : null;
        Company company = request.getCompanyId() != null ? companyRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(request.getCompanyId(), orgId).orElse(null) : null;
        Deal deal = request.getDealId() != null ? dealRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(request.getDealId(), orgId).orElse(null) : null;

        Activity activity = Activity.builder()
                .organization(org)
                .user(user)
                .type(request.getType())
                .title(request.getTitle())
                .description(request.getDescription())
                .lead(lead)
                .contact(contact)
                .company(company)
                .deal(deal)
                .build();

        return mapToResponse(activityRepository.save(activity));
    }

    public ActivityDto.ActivityResponse mapToResponse(Activity a) {
        return ActivityDto.ActivityResponse.builder()
                .id(a.getId())
                .type(a.getType())
                .title(a.getTitle())
                .description(a.getDescription())
                .user(authService.mapUserResponse(a.getUser()))
                .leadId(a.getLead() != null ? a.getLead().getId() : null)
                .contactId(a.getContact() != null ? a.getContact().getId() : null)
                .companyId(a.getCompany() != null ? a.getCompany().getId() : null)
                .dealId(a.getDeal() != null ? a.getDeal().getId() : null)
                .createdAt(a.getCreatedAt())
                .build();
    }
}
