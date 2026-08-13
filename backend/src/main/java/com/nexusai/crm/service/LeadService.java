package com.nexusai.crm.service;

import com.nexusai.crm.dto.ContactDto;
import com.nexusai.crm.dto.DealDto;
import com.nexusai.crm.dto.LeadDto;
import com.nexusai.crm.dto.PageResponse;
import com.nexusai.crm.entity.*;
import com.nexusai.crm.entity.enums.LeadStatus;
import com.nexusai.crm.exception.BadRequestException;
import com.nexusai.crm.exception.ResourceNotFoundException;
import com.nexusai.crm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final ContactRepository contactRepository;
    private final CompanyRepository companyRepository;
    private final DealRepository dealRepository;
    private final PipelineRepository pipelineRepository;
    private final PipelineStageRepository pipelineStageRepository;
    private final AuthService authService;
    private final AuditService auditService;

    public PageResponse<LeadDto.LeadResponse> getLeads(String orgId, String query, LeadStatus status, Pageable pageable) {
        Page<Lead> page;
        if (query != null && !query.isBlank()) {
            page = leadRepository.searchLeads(orgId, query.trim(), pageable);
        } else if (status != null) {
            page = leadRepository.findByOrganizationIdAndStatusAndDeletedAtIsNull(orgId, status, pageable);
        } else {
            page = leadRepository.findByOrganizationIdAndDeletedAtIsNull(orgId, pageable);
        }
        return PageResponse.from(page.map(this::mapToResponse));
    }

    public LeadDto.LeadResponse getLead(String orgId, String leadId) {
        Lead lead = leadRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(leadId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
        return mapToResponse(lead);
    }

    @Transactional
    public LeadDto.LeadResponse createLead(String orgId, LeadDto.CreateLeadRequest request) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        User assignedTo = null;
        if (request.getAssignedToId() != null) {
            assignedTo = userRepository.findByIdAndOrganizationId(request.getAssignedToId(), orgId)
                    .orElse(null);
        }

        Lead lead = Lead.builder()
                .organization(org)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail().toLowerCase())
                .phone(request.getPhone())
                .companyName(request.getCompanyName())
                .jobTitle(request.getJobTitle())
                .status(request.getStatus() != null ? request.getStatus() : LeadStatus.NEW)
                .source(request.getSource() != null ? request.getSource() : com.nexusai.crm.entity.enums.LeadSource.WEBSITE)
                .industry(request.getIndustry())
                .location(request.getLocation())
                .assignedTo(assignedTo)
                .nextFollowUpAt(request.getNextFollowUpAt())
                .build();

        calculateLeadScore(lead);

        lead = leadRepository.save(lead);
        auditService.logAction("CREATE_LEAD", "Lead", lead.getId(), "Created lead for " + lead.getEmail());

        return mapToResponse(lead);
    }

    @Transactional
    public LeadDto.LeadResponse updateLead(String orgId, String leadId, LeadDto.UpdateLeadRequest request) {
        Lead lead = leadRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(leadId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found"));

        if (request.getFirstName() != null) lead.setFirstName(request.getFirstName());
        if (request.getLastName() != null) lead.setLastName(request.getLastName());
        if (request.getEmail() != null) lead.setEmail(request.getEmail().toLowerCase());
        if (request.getPhone() != null) lead.setPhone(request.getPhone());
        if (request.getCompanyName() != null) lead.setCompanyName(request.getCompanyName());
        if (request.getJobTitle() != null) lead.setJobTitle(request.getJobTitle());
        if (request.getStatus() != null) lead.setStatus(request.getStatus());
        if (request.getSource() != null) lead.setSource(request.getSource());
        if (request.getIndustry() != null) lead.setIndustry(request.getIndustry());
        if (request.getLocation() != null) lead.setLocation(request.getLocation());
        if (request.getLastContactedAt() != null) lead.setLastContactedAt(request.getLastContactedAt());
        if (request.getNextFollowUpAt() != null) lead.setNextFollowUpAt(request.getNextFollowUpAt());

        if (request.getAssignedToId() != null) {
            User assignedTo = userRepository.findByIdAndOrganizationId(request.getAssignedToId(), orgId).orElse(null);
            lead.setAssignedTo(assignedTo);
        }

        calculateLeadScore(lead);
        lead = leadRepository.save(lead);

        auditService.logAction("UPDATE_LEAD", "Lead", lead.getId(), "Updated lead details");
        return mapToResponse(lead);
    }

    @Transactional
    public void deleteLead(String orgId, String leadId) {
        Lead lead = leadRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(leadId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
        lead.setDeletedAt(LocalDateTime.now());
        leadRepository.save(lead);
        auditService.logAction("DELETE_LEAD", "Lead", leadId, "Soft deleted lead");
    }

    @Transactional
    public LeadDto.LeadConversionResponse convertLead(String orgId, String leadId, LeadDto.LeadConversionRequest request) {
        Lead lead = leadRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(leadId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found"));

        if (lead.getStatus() == LeadStatus.CONVERTED) {
            throw new BadRequestException("Lead is already converted");
        }

        Organization org = lead.getOrganization();

        // 1. Resolve / Create Contact (prevent duplicate creation if exists)
        Contact contact;
        if (request.getExistingContactId() != null && !request.getExistingContactId().isBlank()) {
            contact = contactRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(request.getExistingContactId(), orgId)
                    .orElseThrow(() -> new ResourceNotFoundException("Specified contact not found"));
        } else {
            Optional<Contact> existingContact = contactRepository.findByOrganizationIdAndEmailIgnoreCaseAndDeletedAtIsNull(orgId, lead.getEmail());
            if (existingContact.isPresent()) {
                contact = existingContact.get();
            } else {
                contact = Contact.builder()
                        .organization(org)
                        .firstName(lead.getFirstName())
                        .lastName(lead.getLastName())
                        .email(lead.getEmail())
                        .phone(lead.getPhone())
                        .jobTitle(lead.getJobTitle())
                        .owner(lead.getAssignedTo())
                        .build();
                contact = contactRepository.save(contact);
            }
        }

        // 2. Resolve / Create Company
        Company company = null;
        if (request.getExistingCompanyId() != null && !request.getExistingCompanyId().isBlank()) {
            company = companyRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(request.getExistingCompanyId(), orgId).orElse(null);
        } else if (lead.getCompanyName() != null && !lead.getCompanyName().isBlank()) {
            Optional<Company> existingComp = companyRepository.findByOrganizationIdAndNameIgnoreCaseAndDeletedAtIsNull(orgId, lead.getCompanyName());
            if (existingComp.isPresent()) {
                company = existingComp.get();
            } else {
                company = Company.builder()
                        .organization(org)
                        .name(lead.getCompanyName())
                        .industry(lead.getIndustry())
                        .location(lead.getLocation())
                        .owner(lead.getAssignedTo())
                        .build();
                company = companyRepository.save(company);
            }
        }

        if (company != null && contact.getCompany() == null) {
            contact.setCompany(company);
            contactRepository.save(contact);
        }

        // 3. Resolve Pipeline & Stage
        Pipeline pipeline;
        if (request.getPipelineId() != null && !request.getPipelineId().isBlank()) {
            pipeline = pipelineRepository.findByIdAndOrganizationId(request.getPipelineId(), orgId)
                    .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found"));
        } else {
            pipeline = pipelineRepository.findByOrganizationIdAndIsDefaultTrue(orgId)
                    .orElseGet(() -> pipelineRepository.findByOrganizationId(orgId).stream().findFirst()
                            .orElseThrow(() -> new ResourceNotFoundException("No sales pipeline found")));
        }

        PipelineStage stage;
        if (request.getStageId() != null && !request.getStageId().isBlank()) {
            stage = pipelineStageRepository.findByIdAndPipelineOrganizationId(request.getStageId(), orgId)
                    .orElseThrow(() -> new ResourceNotFoundException("Pipeline stage not found"));
        } else {
            stage = pipeline.getStages().stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Pipeline has no stages"));
        }

        // 4. Create Deal
        String dealName = (request.getDealName() != null && !request.getDealName().isBlank())
                ? request.getDealName()
                : (lead.getCompanyName() != null ? lead.getCompanyName() + " - Deal" : lead.getFirstName() + " " + lead.getLastName() + " - Opportunity");

        BigDecimal dealValue = request.getDealValue() != null ? request.getDealValue() : BigDecimal.valueOf(10000);

        Deal deal = Deal.builder()
                .organization(org)
                .pipeline(pipeline)
                .stage(stage)
                .company(company)
                .contact(contact)
                .owner(lead.getAssignedTo())
                .name(dealName)
                .value(dealValue)
                .currency("USD")
                .probability(stage.getWinProbability())
                .build();
        deal = dealRepository.save(deal);

        // 5. Update Lead Status
        lead.setStatus(LeadStatus.CONVERTED);
        lead.setConvertedContactId(contact.getId());
        lead.setConvertedCompanyId(company != null ? company.getId() : null);
        lead.setConvertedDealId(deal.getId());
        leadRepository.save(lead);

        auditService.logAction("CONVERT_LEAD", "Lead", lead.getId(), "Converted lead to Contact " + contact.getId() + " and Deal " + deal.getId());

        return LeadDto.LeadConversionResponse.builder()
                .leadId(lead.getId())
                .contactId(contact.getId())
                .companyId(company != null ? company.getId() : null)
                .dealId(deal.getId())
                .message("Lead converted successfully into Contact, Company, and Deal records.")
                .build();
    }

    private void calculateLeadScore(Lead lead) {
        int score = 40;
        StringBuilder reason = new StringBuilder();

        // Factor 1: Job title decision maker
        if (lead.getJobTitle() != null) {
            String title = lead.getJobTitle().toLowerCase();
            if (title.contains("ceo") || title.contains("cto") || title.contains("vp") || title.contains("director") || title.contains("head") || title.contains("founder")) {
                score += 25;
                reason.append("Decision-maker role (+25). ");
            } else if (title.contains("manager") || title.contains("lead")) {
                score += 15;
                reason.append("Management role (+15). ");
            }
        }

        // Factor 2: Lead Source
        if (lead.getSource() != null) {
            switch (lead.getSource()) {
                case REFERRAL -> { score += 20; reason.append("High-intent referral (+20). "); }
                case WEBSITE -> { score += 15; reason.append("Inbound website query (+15). "); }
                case LINKEDIN -> { score += 10; reason.append("LinkedIn inquiry (+10). "); }
                default -> score += 5;
            }
        }

        // Factor 3: Company presence
        if (lead.getCompanyName() != null && !lead.getCompanyName().isBlank()) {
            score += 10;
            reason.append("Verified company details (+10). ");
        }

        // Factor 4: Status progression
        if (lead.getStatus() == LeadStatus.QUALIFIED) {
            score += 15;
            reason.append("Qualified prospect (+15). ");
        } else if (lead.getStatus() == LeadStatus.CONTACTED) {
            score += 10;
            reason.append("Active outreach engaged (+10). ");
        }

        score = Math.min(Math.max(score, 0), 100);
        lead.setLeadScore(score);
        lead.setScoreExplanation(reason.toString().trim());
    }

    public LeadDto.LeadResponse mapToResponse(Lead lead) {
        return LeadDto.LeadResponse.builder()
                .id(lead.getId())
                .firstName(lead.getFirstName())
                .lastName(lead.getLastName())
                .email(lead.getEmail())
                .phone(lead.getPhone())
                .companyName(lead.getCompanyName())
                .jobTitle(lead.getJobTitle())
                .status(lead.getStatus())
                .source(lead.getSource())
                .industry(lead.getIndustry())
                .location(lead.getLocation())
                .leadScore(lead.getLeadScore())
                .scoreExplanation(lead.getScoreExplanation())
                .lastContactedAt(lead.getLastContactedAt())
                .nextFollowUpAt(lead.getNextFollowUpAt())
                .assignedTo(lead.getAssignedTo() != null ? authService.mapUserResponse(lead.getAssignedTo()) : null)
                .convertedContactId(lead.getConvertedContactId())
                .convertedCompanyId(lead.getConvertedCompanyId())
                .convertedDealId(lead.getConvertedDealId())
                .createdAt(lead.getCreatedAt())
                .updatedAt(lead.getUpdatedAt())
                .build();
    }
}
