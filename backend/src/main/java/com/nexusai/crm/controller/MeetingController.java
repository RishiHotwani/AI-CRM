package com.nexusai.crm.controller;

import com.nexusai.crm.dto.MeetingDto;
import com.nexusai.crm.dto.PageResponse;
import com.nexusai.crm.security.SecurityUtils;
import com.nexusai.crm.service.MeetingService;
import com.nexusai.crm.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;
    private final AiService aiService;

    @GetMapping
    public ResponseEntity<PageResponse<MeetingDto.MeetingResponse>> getMeetings(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(meetingService.getMeetings(orgId, PageRequest.of(page, size)));
    }

    @GetMapping("/calendar")
    public ResponseEntity<List<MeetingDto.MeetingResponse>> getCalendarMeetings(
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(meetingService.getCalendarMeetings(orgId, start, end));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MeetingDto.MeetingResponse> getMeeting(@PathVariable("id") String id) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(meetingService.getMeeting(orgId, id));
    }

    @PostMapping
    public ResponseEntity<MeetingDto.MeetingResponse> createMeeting(@Valid @RequestBody MeetingDto.CreateMeetingRequest request) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.status(HttpStatus.CREATED).body(meetingService.createMeeting(orgId, request));
    }

    @PostMapping("/summarize")
    public ResponseEntity<MeetingDto.MeetingSummaryResponse> summarizeMeeting(@Valid @RequestBody MeetingDto.MeetingSummaryRequest request) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(aiService.summarizeMeeting(orgId, request.getTranscript()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeeting(@PathVariable("id") String id) {
        String orgId = SecurityUtils.getCurrentOrgId();
        meetingService.deleteMeeting(orgId, id);
        return ResponseEntity.noContent().build();
    }
}
