package com.nexusai.crm.service;

import com.nexusai.crm.dto.DealDto;
import com.nexusai.crm.dto.PipelineDto;
import com.nexusai.crm.dto.PageResponse;
import com.nexusai.crm.entity.*;
import com.nexusai.crm.entity.enums.ActivityType;
import com.nexusai.crm.entity.enums.RiskLevel;
import com.nexusai.crm.exception.BadRequestException;
import com.nexusai.crm.exception.ResourceNotFoundException;
import com.nexusai.crm.repository.*;
import com.nexusai.crm.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DealService {

    private final DealRepository dealRepository;
    private final OrganizationRepository organizationRepository;
    private final PipelineRepository pipelineRepository;
    private final PipelineStageRepository pipelineStageRepository;
    private final CompanyRepository companyRepository;
    private final ContactRepository contactRepository;
    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;
    private final PipelineService pipelineService;
    private final CompanyService companyService;
    private final ContactService contactService;
    private final AuthService authService;
    private final AuditService auditService;

    public PageResponse<DealDto.DealResponse> getDeals(String orgId, String query, Pageable pageable) {
        Page<Deal> page;
        if (query != null && !query.isBlank()) {
            page = dealRepository.searchDeals(orgId, query.trim(), pageable);
        } else {
            page = dealRepository.findByOrganizationIdAndDeletedAtIsNull(orgId, pageable);
        }
        return PageResponse.from(page.map(this::mapToResponse));
    }

    public List<DealDto.DealResponse> getDealsByPipeline(String orgId, String pipelineId) {
        return dealRepository.findByOrganizationIdAndPipelineIdAndDeletedAtIsNull(orgId, pipelineId)
                .stream().map(this::mapToResponse).toList();
    }

    public DealDto.DealResponse getDeal(String orgId, String dealId) {
        Deal deal = dealRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(dealId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Deal not found"));
        return mapToResponse(deal);
    }

    @Transactional
    public DealDto.DealResponse createDeal(String orgId, DealDto.CreateDealRequest request) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        Pipeline pipeline;
        if (request.getPipelineId() != null && !request.getPipelineId().isBlank()) {
            pipeline = pipelineRepository.findByIdAndOrganizationId(request.getPipelineId(), orgId)
                    .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found"));
        } else {
            pipeline = pipelineRepository.findByOrganizationIdAndIsDefaultTrue(orgId)
                    .orElseGet(() -> pipelineRepository.findByOrganizationId(orgId).stream().findFirst()
                            .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found")));
        }

        PipelineStage stage = pipelineStageRepository.findByIdAndPipelineOrganizationId(request.getStageId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Pipeline stage not found"));

        Company company = null;
        if (request.getCompanyId() != null) {
            company = companyRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(request.getCompanyId(), orgId).orElse(null);
        }

        Contact contact = null;
        if (request.getContactId() != null) {
            contact = contactRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(request.getContactId(), orgId).orElse(null);
        }

        User owner = null;
        if (request.getOwnerId() != null) {
            owner = userRepository.findByIdAndOrganizationId(request.getOwnerId(), orgId).orElse(null);
        }

        Deal deal = Deal.builder()
                .organization(org)
                .pipeline(pipeline)
                .stage(stage)
                .company(company)
                .contact(contact)
                .owner(owner)
                .name(request.getName())
                .value(request.getValue() != null ? request.getValue() : BigDecimal.ZERO)
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .probability(stage.getWinProbability())
                .expectedCloseDate(request.getExpectedCloseDate())
                .description(request.getDescription())
                .build();

        evaluateRisk(deal);

        deal = dealRepository.save(deal);
        auditService.logAction("CREATE_DEAL", "Deal", deal.getId(), "Created deal " + deal.getName());
        return mapToResponse(deal);
    }

    @Transactional
    public DealDto.DealResponse updateDeal(String orgId, String dealId, DealDto.UpdateDealRequest request) {
        Deal deal = dealRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(dealId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Deal not found"));

        if (request.getName() != null) deal.setName(request.getName());
        if (request.getValue() != null) deal.setValue(request.getValue());
        if (request.getCurrency() != null) deal.setCurrency(request.getCurrency());
        if (request.getExpectedCloseDate() != null) deal.setExpectedCloseDate(request.getExpectedCloseDate());
        if (request.getLostReason() != null) deal.setLostReason(request.getLostReason());
        if (request.getDescription() != null) deal.setDescription(request.getDescription());

        if (request.getStageId() != null) {
            PipelineStage stage = pipelineStageRepository.findByIdAndPipelineOrganizationId(request.getStageId(), orgId)
                    .orElseThrow(() -> new ResourceNotFoundException("Pipeline stage not found"));
            deal.setStage(stage);
            deal.setProbability(stage.getWinProbability());
        }

        if (request.getCompanyId() != null) {
            Company company = companyRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(request.getCompanyId(), orgId).orElse(null);
            deal.setCompany(company);
        }

        if (request.getContactId() != null) {
            Contact contact = contactRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(request.getContactId(), orgId).orElse(null);
            deal.setContact(contact);
        }

        if (request.getOwnerId() != null) {
            User owner = userRepository.findByIdAndOrganizationId(request.getOwnerId(), orgId).orElse(null);
            deal.setOwner(owner);
        }

        evaluateRisk(deal);
        deal = dealRepository.save(deal);
        auditService.logAction("UPDATE_DEAL", "Deal", deal.getId(), "Updated deal details");
        return mapToResponse(deal);
    }

    @Transactional
    public DealDto.DealResponse moveDealStage(String orgId, String dealId, DealDto.MoveDealStageRequest request) {
        Deal deal = dealRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(dealId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Deal not found"));

        PipelineStage targetStage = pipelineStageRepository.findByIdAndPipelineOrganizationId(request.getStageId(), orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Pipeline stage not found"));

        // Rule: If moving to Closed Lost stage, lostReason is required
        if (targetStage.isLostStage()) {
            if (request.getLostReason() == null || request.getLostReason().isBlank()) {
                throw new BadRequestException("Lost reason is required when moving a deal to Closed Lost");
            }
            deal.setLostReason(request.getLostReason());
        }

        if (targetStage.isWonStage()) {
            deal.setActualCloseDate(LocalDateTime.now());
        }

        String previousStageName = deal.getStage().getName();
        deal.setStage(targetStage);
        deal.setProbability(targetStage.getWinProbability());

        evaluateRisk(deal);
        deal = dealRepository.save(deal);

        // Record activity log
        User currentUser = SecurityUtils.getAuthenticatedUser();
        Activity activity = Activity.builder()
                .organization(deal.getOrganization())
                .user(currentUser)
                .type(ActivityType.NOTE)
                .title("Moved deal to " + targetStage.getName())
                .description("Deal stage moved from '" + previousStageName + "' to '" + targetStage.getName() + "'." +
                        (targetStage.isLostStage() ? " Reason: " + request.getLostReason() : ""))
                .deal(deal)
                .company(deal.getCompany())
                .contact(deal.getContact())
                .build();
        activityRepository.save(activity);

        auditService.logAction("MOVE_DEAL_STAGE", "Deal", deal.getId(), "Moved deal from " + previousStageName + " to " + targetStage.getName());

        return mapToResponse(deal);
    }

    @Transactional
    public void deleteDeal(String orgId, String dealId) {
        Deal deal = dealRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(dealId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Deal not found"));
        deal.setDeletedAt(LocalDateTime.now());
        dealRepository.save(deal);
        auditService.logAction("DELETE_DEAL", "Deal", dealId, "Soft deleted deal");
    }

    private void evaluateRisk(Deal deal) {
        if (deal.getStage().isWonStage() || deal.getStage().isLostStage()) {
            deal.setDealRiskLevel(RiskLevel.LOW);
            deal.setRiskExplanation("Deal is closed.");
            return;
        }

        int riskScore = 0;
        StringBuilder reason = new StringBuilder();

        // Factor 1: Close date approaching or overdue
        if (deal.getExpectedCloseDate() != null) {
            long daysUntilClose = ChronoUnit.DAYS.between(LocalDate.now(), deal.getExpectedCloseDate());
            if (daysUntilClose < 0) {
                riskScore += 40;
                reason.append("Expected close date has passed by ").append(Math.abs(daysUntilClose)).append(" days. ");
            } else if (daysUntilClose <= 5) {
                riskScore += 25;
                reason.append("Expected close date is in ").append(daysUntilClose).append(" days. ");
            }
        }

        // Factor 2: High value deal stall
        if (deal.getValue().compareTo(BigDecimal.valueOf(50000)) > 0) {
            riskScore += 15;
            reason.append("High deal value opportunity requires executive attention. ");
        }

        // Factor 3: Time since last update
        if (deal.getUpdatedAt() != null) {
            long daysInactive = ChronoUnit.DAYS.between(deal.getUpdatedAt(), LocalDateTime.now());
            if (daysInactive >= 14) {
                riskScore += 30;
                reason.append("No activity recorded for ").append(daysInactive).append(" days. ");
            }
        }

        if (riskScore >= 40) {
            deal.setDealRiskLevel(RiskLevel.HIGH);
        } else if (riskScore >= 20) {
            deal.setDealRiskLevel(RiskLevel.MEDIUM);
        } else {
            deal.setDealRiskLevel(RiskLevel.LOW);
            if (reason.isEmpty()) reason.append("Deal is progressing on track.");
        }
        deal.setRiskExplanation(reason.toString().trim());
    }

    public DealDto.DealResponse mapToResponse(Deal d) {
        PipelineDto.PipelineStageResponse stageResp = PipelineDto.PipelineStageResponse.builder()
                .id(d.getStage().getId())
                .name(d.getStage().getName())
                .stageOrder(d.getStage().getStageOrder())
                .winProbability(d.getStage().getWinProbability())
                .isWonStage(d.getStage().isWonStage())
                .isLostStage(d.getStage().isLostStage())
                .build();

        return DealDto.DealResponse.builder()
                .id(d.getId())
                .name(d.getName())
                .value(d.getValue())
                .currency(d.getCurrency())
                .probability(d.getProbability())
                .expectedCloseDate(d.getExpectedCloseDate())
                .actualCloseDate(d.getActualCloseDate())
                .lostReason(d.getLostReason())
                .dealRiskLevel(d.getDealRiskLevel())
                .riskExplanation(d.getRiskExplanation())
                .description(d.getDescription())
                .stage(stageResp)
                .pipelineId(d.getPipeline().getId())
                .company(d.getCompany() != null ? companyService.mapToResponse(d.getCompany()) : null)
                .contact(d.getContact() != null ? contactService.mapToResponse(d.getContact()) : null)
                .owner(d.getOwner() != null ? authService.mapUserResponse(d.getOwner()) : null)
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .build();
    }
}
