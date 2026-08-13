package com.nexusai.crm.service;

import com.nexusai.crm.dto.ContactDto;
import com.nexusai.crm.dto.PageResponse;
import com.nexusai.crm.entity.Company;
import com.nexusai.crm.entity.Contact;
import com.nexusai.crm.entity.Organization;
import com.nexusai.crm.entity.User;
import com.nexusai.crm.exception.BadRequestException;
import com.nexusai.crm.exception.ResourceNotFoundException;
import com.nexusai.crm.repository.CompanyRepository;
import com.nexusai.crm.repository.ContactRepository;
import com.nexusai.crm.repository.OrganizationRepository;
import com.nexusai.crm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;
    private final OrganizationRepository organizationRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final AuditService auditService;

    public PageResponse<ContactDto.ContactResponse> getContacts(String orgId, String query, Pageable pageable) {
        Page<Contact> page;
        if (query != null && !query.isBlank()) {
            page = contactRepository.searchContacts(orgId, query.trim(), pageable);
        } else {
            page = contactRepository.findByOrganizationIdAndDeletedAtIsNull(orgId, pageable);
        }
        return PageResponse.from(page.map(this::mapToResponse));
    }

    public ContactDto.ContactResponse getContact(String orgId, String contactId) {
        Contact contact = contactRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(contactId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
        return mapToResponse(contact);
    }

    @Transactional
    public ContactDto.ContactResponse createContact(String orgId, ContactDto.CreateContactRequest request) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        if (contactRepository.findByOrganizationIdAndEmailIgnoreCaseAndDeletedAtIsNull(orgId, request.getEmail()).isPresent()) {
            throw new BadRequestException("A contact with email " + request.getEmail() + " already exists in your workspace.");
        }

        Company company = null;
        if (request.getCompanyId() != null) {
            company = companyRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(request.getCompanyId(), orgId).orElse(null);
        }

        User owner = null;
        if (request.getOwnerId() != null) {
            owner = userRepository.findByIdAndOrganizationId(request.getOwnerId(), orgId).orElse(null);
        }

        Contact contact = Contact.builder()
                .organization(org)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail().toLowerCase())
                .phone(request.getPhone())
                .jobTitle(request.getJobTitle())
                .company(company)
                .owner(owner)
                .linkedinUrl(request.getLinkedinUrl())
                .location(request.getLocation())
                .tags(request.getTags())
                .build();

        contact = contactRepository.save(contact);
        auditService.logAction("CREATE_CONTACT", "Contact", contact.getId(), "Created contact " + contact.getEmail());
        return mapToResponse(contact);
    }

    @Transactional
    public ContactDto.ContactResponse updateContact(String orgId, String contactId, ContactDto.UpdateContactRequest request) {
        Contact contact = contactRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(contactId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));

        if (request.getFirstName() != null) contact.setFirstName(request.getFirstName());
        if (request.getLastName() != null) contact.setLastName(request.getLastName());
        if (request.getEmail() != null) contact.setEmail(request.getEmail().toLowerCase());
        if (request.getPhone() != null) contact.setPhone(request.getPhone());
        if (request.getJobTitle() != null) contact.setJobTitle(request.getJobTitle());
        if (request.getLinkedinUrl() != null) contact.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getLocation() != null) contact.setLocation(request.getLocation());
        if (request.getTags() != null) contact.setTags(request.getTags());

        if (request.getCompanyId() != null) {
            Company company = companyRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(request.getCompanyId(), orgId).orElse(null);
            contact.setCompany(company);
        }

        if (request.getOwnerId() != null) {
            User owner = userRepository.findByIdAndOrganizationId(request.getOwnerId(), orgId).orElse(null);
            contact.setOwner(owner);
        }

        contact = contactRepository.save(contact);
        auditService.logAction("UPDATE_CONTACT", "Contact", contact.getId(), "Updated contact details");
        return mapToResponse(contact);
    }

    @Transactional
    public void deleteContact(String orgId, String contactId) {
        Contact contact = contactRepository.findByIdAndOrganizationIdAndDeletedAtIsNull(contactId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
        contact.setDeletedAt(LocalDateTime.now());
        contactRepository.save(contact);
        auditService.logAction("DELETE_CONTACT", "Contact", contactId, "Soft deleted contact");
    }

    public ContactDto.ContactResponse mapToResponse(Contact c) {
        ContactDto.CompanySummary companySummary = null;
        if (c.getCompany() != null) {
            companySummary = ContactDto.CompanySummary.builder()
                    .id(c.getCompany().getId())
                    .name(c.getCompany().getName())
                    .website(c.getCompany().getWebsite())
                    .industry(c.getCompany().getIndustry())
                    .build();
        }

        return ContactDto.ContactResponse.builder()
                .id(c.getId())
                .firstName(c.getFirstName())
                .lastName(c.getLastName())
                .email(c.getEmail())
                .phone(c.getPhone())
                .jobTitle(c.getJobTitle())
                .linkedinUrl(c.getLinkedinUrl())
                .location(c.getLocation())
                .tags(c.getTags())
                .company(companySummary)
                .owner(c.getOwner() != null ? authService.mapUserResponse(c.getOwner()) : null)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
