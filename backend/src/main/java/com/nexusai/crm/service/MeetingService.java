package com.nexusai.crm.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexusai.crm.dto.MeetingDto;
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final OrganizationRepository organizationRepository;
    private final ContactRepository contactRepository;
    private final CompanyRepository companyRepository;
    private final DealRepository dealRepository;
    private final CompanyService companyService;
    private final ContactService contactService;
    private final DealService dealService;
    private final AuthService authService;
    private final ObjectMapper objectMapper;

    public PageResponse<MeetingDto.MeetingResponse> getMeetings(String orgId, Pageable pageable) {
        Page<Meeting> page = meetingRepository.findByOrganizationIdOrderByStartTimeDesc(orgId, pageable);
        return PageResponse.from(page.map(this::mapToResponse));
    }

    public List<MeetingDto.MeetingResponse> getCalendarMeetings(String orgId, LocalDateTime start, LocalDateTime end) {
        return meetingRepository.findByOrganizationIdAndStartTimeBetweenOrderByStartTimeAsc(orgId, start, end)
                .stream().map(this::mapToResponse).toList();
    }

    public MeetingDto.MeetingResponse getMeeting(String orgId, String meetingId) {
        Meeting meeting = meetingRepository.findByIdAndOrganizationId(meetingId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found"));
        return mapToResponse(meeting);
    }

    @Transactional
    public MeetingDto.MeetingResponse createMeeting(String orgId, MeetingDto.CreateMeetingRequest request) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        User organizer = SecurityUtils.getAuthenticatedUser();

        Contact contact = request.getContactId() != null ? contactRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(request.getContactId(), orgId).orElse(null) : null;
        Company company = request.getCompanyId() != null ? companyRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(request.getCompanyId(), orgId).orElse(null) : null;
        Deal deal = request.getDealId() != null ? dealRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(request.getDealId(), orgId).orElse(null) : null;

        Meeting meeting = Meeting.builder()
                .organization(org)
                .organizer(organizer)
                .title(request.getTitle())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .location(request.getLocation())
                .meetingLink(request.getMeetingLink())
                .transcript(request.getTranscript())
                .contact(contact)
                .company(company)
                .deal(deal)
                .build();

        return mapToResponse(meetingRepository.save(meeting));
    }

    @Transactional
    public void deleteMeeting(String orgId, String meetingId) {
        Meeting meeting = meetingRepository.findByIdAndOrganizationId(meetingId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found"));
        meetingRepository.delete(meeting);
    }

    public MeetingDto.MeetingResponse mapToResponse(Meeting m) {
        List<String> actionItems = new ArrayList<>();
        if (m.getActionItemsJson() != null && !m.getActionItemsJson().isBlank()) {
            try {
                actionItems = objectMapper.readValue(m.getActionItemsJson(), new TypeReference<>() {});
            } catch (Exception ignored) {}
        }

        return MeetingDto.MeetingResponse.builder()
                .id(m.getId())
                .title(m.getTitle())
                .description(m.getDescription())
                .startTime(m.getStartTime())
                .endTime(m.getEndTime())
                .location(m.getLocation())
                .meetingLink(m.getMeetingLink())
                .transcript(m.getTranscript())
                .aiSummary(m.getAiSummary())
                .actionItems(actionItems)
                .organizer(authService.mapUserResponse(m.getOrganizer()))
                .contact(m.getContact() != null ? contactService.mapToResponse(m.getContact()) : null)
                .company(m.getCompany() != null ? companyService.mapToResponse(m.getCompany()) : null)
                .deal(m.getDeal() != null ? dealService.mapToResponse(m.getDeal()) : null)
                .createdAt(m.getCreatedAt())
                .build();
    }
}
