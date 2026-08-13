package com.nexusai.crm.controller;

import com.nexusai.crm.dto.ContactDto;
import com.nexusai.crm.dto.PageResponse;
import com.nexusai.crm.security.SecurityUtils;
import com.nexusai.crm.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @GetMapping
    public ResponseEntity<PageResponse<ContactDto.ContactResponse>> getContacts(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(contactService.getContacts(orgId, query, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactDto.ContactResponse> getContact(@PathVariable("id") String id) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(contactService.getContact(orgId, id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'SALES_MANAGER', 'SALES_REP')")
    public ResponseEntity<ContactDto.ContactResponse> createContact(@Valid @RequestBody ContactDto.CreateContactRequest request) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.status(HttpStatus.CREATED).body(contactService.createContact(orgId, request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'SALES_MANAGER', 'SALES_REP')")
    public ResponseEntity<ContactDto.ContactResponse> updateContact(
            @PathVariable("id") String id,
            @RequestBody ContactDto.UpdateContactRequest request) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(contactService.updateContact(orgId, id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'SALES_MANAGER')")
    public ResponseEntity<Void> deleteContact(@PathVariable("id") String id) {
        String orgId = SecurityUtils.getCurrentOrgId();
        contactService.deleteContact(orgId, id);
        return ResponseEntity.noContent().build();
    }
}
