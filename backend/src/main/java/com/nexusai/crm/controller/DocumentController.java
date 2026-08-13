package com.nexusai.crm.controller;

import com.nexusai.crm.dto.DocumentDto;
import com.nexusai.crm.dto.PageResponse;
import com.nexusai.crm.entity.Document;
import com.nexusai.crm.repository.DocumentRepository;
import com.nexusai.crm.security.SecurityUtils;
import com.nexusai.crm.service.AuthService;
import com.nexusai.crm.service.RagService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final RagService ragService;
    private final DocumentRepository documentRepository;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<PageResponse<DocumentDto.DocumentResponse>> getDocuments(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        String orgId = SecurityUtils.getCurrentOrgId();
        Page<Document> docs = documentRepository.findByOrganizationIdOrderByCreatedAtDesc(orgId, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(PageResponse.from(docs.map(d -> DocumentDto.DocumentResponse.builder()
                .id(d.getId())
                .title(d.getTitle())
                .fileName(d.getFileName())
                .fileType(d.getFileType())
                .fileSize(d.getFileSize())
                .vectorIndexed(d.isVectorIndexed())
                .uploadedBy(authService.mapUserResponse(d.getUploadedBy()))
                .createdAt(d.getCreatedAt())
                .build())));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentDto.DocumentResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title) {
        String orgId = SecurityUtils.getCurrentOrgId();
        Document doc = ragService.processAndIndexDocument(orgId, file, title);
        return ResponseEntity.status(HttpStatus.CREATED).body(DocumentDto.DocumentResponse.builder()
                .id(doc.getId())
                .title(doc.getTitle())
                .fileName(doc.getFileName())
                .fileType(doc.getFileType())
                .fileSize(doc.getFileSize())
                .vectorIndexed(doc.isVectorIndexed())
                .uploadedBy(authService.mapUserResponse(doc.getUploadedBy()))
                .createdAt(doc.getCreatedAt())
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable("id") String id) {
        String orgId = SecurityUtils.getCurrentOrgId();
        ragService.deleteDocument(orgId, id);
        return ResponseEntity.noContent().build();
    }
}
