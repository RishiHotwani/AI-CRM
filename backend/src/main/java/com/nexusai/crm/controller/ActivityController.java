package com.nexusai.crm.controller;

import com.nexusai.crm.dto.ActivityDto;
import com.nexusai.crm.dto.PageResponse;
import com.nexusai.crm.security.SecurityUtils;
import com.nexusai.crm.service.ActivityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<PageResponse<ActivityDto.ActivityResponse>> getActivities(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(activityService.getActivities(orgId, PageRequest.of(page, size)));
    }

    @GetMapping("/lead/{leadId}")
    public ResponseEntity<List<ActivityDto.ActivityResponse>> getActivitiesForLead(@PathVariable("leadId") String leadId) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(activityService.getActivitiesForLead(orgId, leadId));
    }

    @GetMapping("/contact/{contactId}")
    public ResponseEntity<List<ActivityDto.ActivityResponse>> getActivitiesForContact(@PathVariable("contactId") String contactId) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(activityService.getActivitiesForContact(orgId, contactId));
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<ActivityDto.ActivityResponse>> getActivitiesForCompany(@PathVariable("companyId") String companyId) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(activityService.getActivitiesForCompany(orgId, companyId));
    }

    @GetMapping("/deal/{dealId}")
    public ResponseEntity<List<ActivityDto.ActivityResponse>> getActivitiesForDeal(@PathVariable("dealId") String dealId) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(activityService.getActivitiesForDeal(orgId, dealId));
    }

    @PostMapping
    public ResponseEntity<ActivityDto.ActivityResponse> createActivity(@Valid @RequestBody ActivityDto.CreateActivityRequest request) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.status(HttpStatus.CREATED).body(activityService.createActivity(orgId, request));
    }
}
