package com.nexusai.crm.controller;

import com.nexusai.crm.dto.DashboardDto;
import com.nexusai.crm.security.SecurityUtils;
import com.nexusai.crm.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardDto.DashboardStatsResponse> getDashboardStats() {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(dashboardService.getDashboardStats(orgId));
    }
}
