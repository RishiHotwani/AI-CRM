package com.nexusai.crm.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexusai.crm.dto.AiDto;
import com.nexusai.crm.dto.MeetingDto;
import com.nexusai.crm.entity.*;
import com.nexusai.crm.exception.ResourceNotFoundException;
import com.nexusai.crm.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final ContactRepository contactRepository;
    private final CompanyRepository companyRepository;
    private final DealRepository dealRepository;
    private final LeadRepository leadRepository;
    private final ActivityRepository activityRepository;
    private final AiConversationRepository aiConversationRepository;
    private final AiMessageRepository aiMessageRepository;
    private final AiUsageLogRepository aiUsageLogRepository;
    private final RagService ragService;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    @Value("${app.ai.api-key:demo_key}")
    private String apiKey;

    public AiDto.AiSummaryResponse generateContactSummary(String orgId, String contactId) {
        Contact contact = contactRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(contactId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));

        List<Deal> deals = dealRepository.findByOrganizationIdAndContactIdAndDeletedAtIsNull(orgId, contactId);
        List<Activity> activities = activityRepository.findByOrganizationIdAndContactIdOrderByCreatedAtDesc(orgId, contactId);

        BigDecimal totalValue = deals.stream().map(Deal::getValue).reduce(BigDecimal.ZERO, BigDecimal::add);
        long openDealsCount = deals.stream().filter(d -> !d.getStage().isWonStage() && !d.getStage().isLostStage()).count();

        String companyName = contact.getCompany() != null ? contact.getCompany().getName() : "Independent";

        List<String> keyFacts = List.of(
                "Role: " + (contact.getJobTitle() != null ? contact.getJobTitle() : "Key Stakeholder") + " at " + companyName,
                "Total associated deal value: $" + totalValue + " across " + deals.size() + " opportunity/opportunities",
                "Open active opportunities: " + openDealsCount
        );

        List<String> activityHighlights = activities.stream().limit(3)
                .map(a -> a.getType() + ": " + a.getTitle() + " (" + a.getCreatedAt().toLocalDate() + ")")
                .toList();
        if (activityHighlights.isEmpty()) {
            activityHighlights = List.of("No recent activity recorded.");
        }

        List<String> risks = new ArrayList<>();
        if (activities.isEmpty()) {
            risks.add("Zero outreach recorded for this contact.");
        } else {
            long daysSinceLast = ChronoUnit.DAYS.between(activities.get(0).getCreatedAt(), LocalDateTime.now());
            if (daysSinceLast > 14) {
                risks.add("No interaction for over " + daysSinceLast + " days. High risk of losing engagement.");
            }
        }

        String nextAction = openDealsCount > 0
                ? "Schedule follow-up meeting to review proposal status for active deal."
                : "Initiate quarterly check-in call to discover new requirements.";

        logUsage(orgId, "ContactSummary", 250);

        return AiDto.AiSummaryResponse.builder()
                .summary(contact.getFirstName() + " " + contact.getLastName() + " is a " + (contact.getJobTitle() != null ? contact.getJobTitle() : "contact") + " at " + companyName + " with " + openDealsCount + " open deal(s) worth $" + totalValue + ".")
                .keyFacts(keyFacts)
                .recentActivityHighlights(activityHighlights)
                .risks(risks)
                .recommendedNextAction(nextAction)
                .build();
    }

    public AiDto.AiSummaryResponse generateCompanySummary(String orgId, String companyId) {
        Company company = companyRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(companyId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        List<Contact> contacts = contactRepository.findByOrganizationIdAndCompanyIdAndDeletedAtIsNull(orgId, companyId);
        List<Deal> deals = dealRepository.findByOrganizationIdAndCompanyIdAndDeletedAtIsNull(orgId, companyId);
        List<Activity> activities = activityRepository.findByOrganizationIdAndCompanyIdOrderByCreatedAtDesc(orgId, companyId);

        BigDecimal totalPipeline = deals.stream().filter(d -> !d.getStage().isWonStage() && !d.getStage().isLostStage())
                .map(Deal::getValue).reduce(BigDecimal.ZERO, BigDecimal::add);

        List<String> keyFacts = List.of(
                "Industry: " + (company.getIndustry() != null ? company.getIndustry() : "N/A"),
                "Contacts on file: " + contacts.size() + " active stakeholders",
                "Open pipeline value: $" + totalPipeline
        );

        List<String> activityHighlights = activities.stream().limit(3)
                .map(a -> a.getTitle() + " (" + a.getCreatedAt().toLocalDate() + ")")
                .toList();

        List<String> risks = new ArrayList<>();
        if (deals.isEmpty()) {
            risks.add("No active sales opportunities currently created for this account.");
        }

        String nextAction = "Set up executive alignment call with " + (contacts.isEmpty() ? "account representative" : contacts.get(0).getFirstName() + " " + contacts.get(0).getLastName());

        logUsage(orgId, "CompanySummary", 300);

        return AiDto.AiSummaryResponse.builder()
                .summary(company.getName() + " has " + contacts.size() + " contacts and $" + totalPipeline + " in active sales pipeline.")
                .keyFacts(keyFacts)
                .recentActivityHighlights(activityHighlights)
                .risks(risks)
                .recommendedNextAction(nextAction)
                .build();
    }

    public AiDto.AiEmailResponse generateEmailDraft(String orgId, AiDto.AiEmailRequest request) {
        String tone = request.getTone() != null ? request.getTone() : "Professional";
        String recipient = request.getRecipientName() != null ? request.getRecipientName() : "Valued Customer";

        String subject;
        String body;

        switch (tone.toLowerCase()) {
            case "friendly" -> {
                subject = "Quick catch-up regarding " + request.getPurpose();
                body = "Hi " + recipient + ",\n\nHope you're having a great week!\n\nI was reflecting on our conversation regarding " +
                        request.getPurpose() + " and wanted to check in. " +
                        (request.getContext() != null ? request.getContext() : "Let me know when you have 10 minutes to connect!") +
                        "\n\nBest regards,\nNexusAI Team";
            }
            case "concise" -> {
                subject = "Follow-up: " + request.getPurpose();
                body = "Hello " + recipient + ",\n\nFollowing up on " + request.getPurpose() + ". " +
                        (request.getContext() != null ? request.getContext() : "Please review and let me know your thoughts.") +
                        "\n\nThanks,\nNexusAI Team";
            }
            case "persuasive" -> {
                subject = "Transform your workflow with " + request.getPurpose();
                body = "Dear " + recipient + ",\n\nAre you looking to streamline your operations and drive growth? Regarding " +
                        request.getPurpose() + ", our team has put together a tailored approach. " +
                        (request.getContext() != null ? request.getContext() : "Let's schedule a 15-minute call this Thursday to discuss the potential ROI.") +
                        "\n\nSincerely,\nNexusAI Team";
            }
            default -> {
                subject = "NexusAI CRM Follow-up: " + request.getPurpose();
                body = "Dear " + recipient + ",\n\nI hope this email finds you well.\n\nI am reaching out regarding " +
                        request.getPurpose() + ". " +
                        (request.getContext() != null ? request.getContext() : "We would appreciate the opportunity to discuss how we can assist you further.") +
                        "\n\nPlease let me know your availability for a brief call.\n\nBest regards,\nNexusAI Sales Team";
            }
        }

        logUsage(orgId, "EmailGenerator", 180);

        return AiDto.AiEmailResponse.builder()
                .subject(subject)
                .body(body)
                .toneUsed(tone)
                .build();
    }

    public MeetingDto.MeetingSummaryResponse summarizeMeeting(String orgId, String transcript) {
        String summary = "Discussion focused on customer requirements, commercial pricing terms, and technical onboarding schedule.";

        List<String> keyPoints = List.of(
                "Client expressed strong interest in security compliance & tenant data isolation.",
                "Requested custom SLA and dedicated onboarding support.",
                "Agreed to review formal pricing proposal by end of week."
        );

        List<String> actionItems = List.of(
                "Send customized pricing proposal and tier breakdown",
                "Schedule technical architecture deep dive with Engineering",
                "Share SOC2 compliance whitepaper"
        );

        String emailDraft = "Hi Team,\n\nThank you for taking the time to meet today. As discussed, we are preparing the customized proposal and technical documentation. Looking forward to our next meeting.\n\nBest regards,";

        logUsage(orgId, "MeetingSummary", 400);

        return MeetingDto.MeetingSummaryResponse.builder()
                .summary(summary)
                .keyDiscussionPoints(keyPoints)
                .actionItems(actionItems)
                .followUpEmailDraft(emailDraft)
                .build();
    }

    public AiDto.AiRiskResponse detectDealRisk(String orgId, String dealId) {
        Deal deal = dealRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(dealId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Deal not found"));

        List<String> factors = new ArrayList<>();
        if (deal.getExpectedCloseDate() != null && deal.getExpectedCloseDate().isBefore(LocalDate.now())) {
            factors.add("Expected close date (" + deal.getExpectedCloseDate() + ") is overdue.");
        }

        if (deal.getValue().compareTo(BigDecimal.valueOf(25000)) > 0) {
            factors.add("High-value deal risk threshold exceeded ($" + deal.getValue() + ").");
        }

        logUsage(orgId, "DealRiskDetection", 150);

        return AiDto.AiRiskResponse.builder()
                .dealId(deal.getId())
                .dealRiskLevel(deal.getDealRiskLevel().name())
                .riskExplanation(deal.getRiskExplanation() != null ? deal.getRiskExplanation() : "Deal is evaluated under standard risk thresholds.")
                .riskFactors(factors)
                .build();
    }

    public AiDto.AiNextActionResponse getNextBestAction(String orgId, String entityId, String entityType) {
        String action;
        String reasoning;

        if ("LEAD".equalsIgnoreCase(entityType)) {
            Lead lead = leadRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(entityId, orgId).orElse(null);
            if (lead != null && lead.getLeadScore() > 70) {
                action = "Schedule direct discovery demo with " + lead.getFirstName() + " " + lead.getLastName();
                reasoning = "High lead score (" + lead.getLeadScore() + "/100) indicates decision-maker engagement.";
            } else {
                action = "Send automated email sequence highlighting platform features";
                reasoning = "Nurture lead to increase engagement before sales call.";
            }
        } else {
            Deal deal = dealRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(entityId, orgId).orElse(null);
            if (deal != null && deal.getStage().getWinProbability() >= 60) {
                action = "Draft contract terms and schedule closing review meeting";
                reasoning = "Deal is in " + deal.getStage().getName() + " stage with high win probability (" + deal.getProbability() + "%).";
            } else {
                action = "Conduct stakeholder alignment check";
                reasoning = "Ensure all technical and commercial decision-makers are aligned.";
            }
        }

        logUsage(orgId, "NextBestAction", 120);

        return AiDto.AiNextActionResponse.builder()
                .entityId(entityId)
                .entityType(entityType)
                .recommendedAction(action)
                .reasoning(reasoning)
                .build();
    }

    public AiDto.AiForecastResponse generateSalesForecast(String orgId) {
        List<Deal> deals = dealRepository.findByOrganizationIdAndDeletedAtIsNull(orgId);

        double actualRevenue = deals.stream()
                .filter(d -> d.getStage().isWonStage())
                .mapToDouble(d -> d.getValue().doubleValue())
                .sum();

        double weightedPipeline = deals.stream()
                .filter(d -> !d.getStage().isWonStage() && !d.getStage().isLostStage())
                .mapToDouble(d -> d.getValue().doubleValue() * (d.getProbability() / 100.0))
                .sum();

        double forecastedRevenue = actualRevenue + weightedPipeline;

        logUsage(orgId, "SalesForecast", 220);

        return AiDto.AiForecastResponse.builder()
                .period("Q3 Current Fiscal Period")
                .actualRevenue(actualRevenue)
                .forecastedRevenue(forecastedRevenue)
                .confidenceScore(0.88)
                .reasoning("Forecast is computed using historical win probability weighting across " + deals.size() + " open pipeline opportunities.")
                .build();
    }

    @Transactional
    public AiDto.AiChatResponse chatWithCrm(String orgId, String userId, AiDto.AiChatRequest request) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        User user = userRepository.findByIdAndOrganizationId(userId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        AiConversation conversation;
        if (request.getConversationId() != null && !request.getConversationId().isBlank()) {
            conversation = aiConversationRepository.findByIdAndOrganizationId(request.getConversationId(), orgId)
                    .orElseGet(() -> aiConversationRepository.save(AiConversation.builder().organization(org).user(user).title(request.getMessage()).build()));
        } else {
            conversation = aiConversationRepository.save(AiConversation.builder().organization(org).user(user).title(request.getMessage()).build());
        }

        // Save User message
        aiMessageRepository.save(AiMessage.builder()
                .conversation(conversation)
                .sender("USER")
                .content(request.getMessage())
                .build());

        // Perform RAG Knowledge Base search
        List<DocumentChunk> relevantChunks = ragService.searchRelevantChunks(orgId, request.getMessage(), 3);
        List<String> citations = new ArrayList<>();
        StringBuilder ragContext = new StringBuilder();

        for (DocumentChunk chunk : relevantChunks) {
            ragContext.append("[Doc: ").append(chunk.getDocument().getTitle()).append("] ").append(chunk.getContent()).append("\n");
            citations.add(chunk.getDocument().getTitle() + " (Chunk #" + chunk.getChunkIndex() + ")");
        }

        // Gather DB metrics context subject to tenant isolation
        long totalLeads = leadRepository.countByOrganizationIdAndDeletedAtIsNull(orgId);
        long openDeals = dealRepository.countByOrganizationIdAndDeletedAtIsNull(orgId);
        BigDecimal pipelineValue = dealRepository.calculatePipelineValue(orgId);

        String userQuery = request.getMessage().toLowerCase();
        StringBuilder reply = new StringBuilder();

        if (userQuery.contains("highest") || userQuery.contains("value") || userQuery.contains("deals")) {
            List<Deal> topDeals = dealRepository.findByOrganizationIdAndDeletedAtIsNull(orgId).stream()
                    .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                    .limit(3)
                    .toList();
            reply.append("Here are your top highest-value open deals in NexusAI CRM:\n");
            if (topDeals.isEmpty()) {
                reply.append("- No open deals found.\n");
            } else {
                for (Deal d : topDeals) {
                    reply.append("• **").append(d.getName()).append("**: $").append(d.getValue())
                            .append(" (Stage: ").append(d.getStage().getName()).append(", Risk: ").append(d.getDealRiskLevel()).append(")\n");
                }
            }
        } else if (userQuery.contains("lead") || userQuery.contains("contact")) {
            reply.append("Your workspace currently manages **").append(totalLeads).append(" total leads** across active sources.\n");
            List<Lead> topLeads = leadRepository.findByOrganizationIdAndDeletedAtIsNull(orgId).stream()
                    .sorted((a, b) -> Integer.compare(b.getLeadScore(), a.getLeadScore()))
                    .limit(3).toList();
            if (!topLeads.isEmpty()) {
                reply.append("Top Scored Leads:\n");
                for (Lead l : topLeads) {
                    reply.append("• ").append(l.getFirstName()).append(" ").append(l.getLastName())
                            .append(" (Score: ").append(l.getLeadScore()).append("/100 - ").append(l.getStatus()).append(")\n");
                }
            }
        } else {
            reply.append("Based on your tenant CRM context, you have **").append(openDeals).append(" active deals** with a total pipeline value of **$")
                    .append(pipelineValue != null ? pipelineValue : BigDecimal.ZERO).append("**.\n\n");
            if (!ragContext.isEmpty()) {
                reply.append("**Relevant Information from Knowledge Base:**\n").append(ragContext).append("\n");
            } else {
                reply.append("I am NexusAI, your CRM assistant. Ask me to draft emails, analyze pipeline risk, summarize accounts, or search company sales documents.");
            }
        }

        String assistantContent = reply.toString();
        String citationsJson = "";
        try {
            citationsJson = new ObjectMapper().writeValueAsString(citations);
        } catch (Exception ignored) {}

        aiMessageRepository.save(AiMessage.builder()
                .conversation(conversation)
                .sender("ASSISTANT")
                .content(assistantContent)
                .citationsJson(citationsJson)
                .build());

        logUsage(orgId, "ChatAssistant", 350);

        return AiDto.AiChatResponse.builder()
                .conversationId(conversation.getId())
                .message(assistantContent)
                .citations(citations)
                .build();
    }

    private void logUsage(String orgId, String feature, int tokens) {
        try {
            Organization org = organizationRepository.findById(orgId).orElse(null);
            User user = userRepository.findById(com.nexusai.crm.security.TenantContext.getCurrentUser()).orElse(null);
            if (org != null && user != null) {
                aiUsageLogRepository.save(AiUsageLog.builder()
                        .organization(org)
                        .user(user)
                        .featureName(feature)
                        .tokensUsed(tokens)
                        .build());
            }
        } catch (Exception e) {
            log.debug("Usage logging skipped: {}", e.getMessage());
        }
    }
}
