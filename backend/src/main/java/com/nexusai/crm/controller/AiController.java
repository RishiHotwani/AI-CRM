package com.nexusai.crm.controller;

import com.nexusai.crm.dto.AiDto;
import com.nexusai.crm.security.SecurityUtils;
import com.nexusai.crm.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @GetMapping("/contact-summary/{contactId}")
    public ResponseEntity<AiDto.AiSummaryResponse> getContactSummary(@PathVariable("contactId") String contactId) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(aiService.generateContactSummary(orgId, contactId));
    }

    @GetMapping("/company-summary/{companyId}")
    public ResponseEntity<AiDto.AiSummaryResponse> getCompanySummary(@PathVariable("companyId") String companyId) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(aiService.generateCompanySummary(orgId, companyId));
    }

    @PostMapping("/email-generator")
    public ResponseEntity<AiDto.AiEmailResponse> generateEmailDraft(@Valid @RequestBody AiDto.AiEmailRequest request) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(aiService.generateEmailDraft(orgId, request));
    }

    @GetMapping("/deal-risk/{dealId}")
    public ResponseEntity<AiDto.AiRiskResponse> getDealRisk(@PathVariable("dealId") String dealId) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(aiService.detectDealRisk(orgId, dealId));
    }

    @GetMapping("/next-action")
    public ResponseEntity<AiDto.AiNextActionResponse> getNextAction(
            @RequestParam("entityId") String entityId,
            @RequestParam("entityType") String entityType) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(aiService.getNextBestAction(orgId, entityId, entityType));
    }

    @GetMapping("/forecast")
    public ResponseEntity<AiDto.AiForecastResponse> getForecast() {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(aiService.generateSalesForecast(orgId));
    }

    @PostMapping("/chat")
    public ResponseEntity<AiDto.AiChatResponse> chatWithCrm(@Valid @RequestBody AiDto.AiChatRequest request) {
        String orgId = SecurityUtils.getCurrentOrgId();
        String userId = SecurityUtils.getAuthenticatedUser().getId();
        return ResponseEntity.ok(aiService.chatWithCrm(orgId, userId, request));
    }
}
