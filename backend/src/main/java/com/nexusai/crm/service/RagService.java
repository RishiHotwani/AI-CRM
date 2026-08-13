package com.nexusai.crm.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexusai.crm.entity.Document;
import com.nexusai.crm.entity.DocumentChunk;
import com.nexusai.crm.entity.Organization;
import com.nexusai.crm.entity.User;
import com.nexusai.crm.exception.BadRequestException;
import com.nexusai.crm.exception.ResourceNotFoundException;
import com.nexusai.crm.repository.DocumentChunkRepository;
import com.nexusai.crm.repository.DocumentRepository;
import com.nexusai.crm.repository.OrganizationRepository;
import com.nexusai.crm.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class RagService {

    private final DocumentRepository documentRepository;
    private final DocumentChunkRepository documentChunkRepository;
    private final OrganizationRepository organizationRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public Document processAndIndexDocument(String orgId, MultipartFile file, String title) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        User user = SecurityUtils.getAuthenticatedUser();

        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.txt";
        String fileType = file.getContentType() != null ? file.getContentType() : "text/plain";

        String extractedText = extractText(file);
        if (extractedText.isBlank()) {
            throw new BadRequestException("Uploaded document contains no readable text");
        }

        Document doc = Document.builder()
                .organization(org)
                .uploadedBy(user)
                .title(title != null && !title.isBlank() ? title : fileName)
                .fileName(fileName)
                .fileType(fileType)
                .fileSize(file.getSize())
                .filePath("/uploads/" + UUID.randomUUID() + "_" + fileName)
                .vectorIndexed(false)
                .build();
        doc = documentRepository.save(doc);

        // Chunking text
        List<String> textChunks = chunkText(extractedText, 500, 50);
        List<DocumentChunk> chunks = new ArrayList<>();

        for (int i = 0; i < textChunks.size(); i++) {
            String chunkContent = textChunks.get(i);
            float[] vector = generateVectorEmbedding(chunkContent);
            String vectorJson = "";
            try {
                vectorJson = objectMapper.writeValueAsString(vector);
            } catch (Exception ignored) {}

            chunks.add(DocumentChunk.builder()
                    .document(doc)
                    .organization(org)
                    .chunkIndex(i)
                    .content(chunkContent)
                    .embeddingJson(vectorJson)
                    .build());
        }

        documentChunkRepository.saveAll(chunks);
        doc.setVectorIndexed(true);
        return documentRepository.save(doc);
    }

    @Transactional
    public void deleteDocument(String orgId, String docId) {
        Document doc = documentRepository.findById(docId)
                .filter(d -> d.getOrganization().getId().equals(orgId))
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        documentChunkRepository.deleteByDocumentId(doc.getId());
        documentRepository.delete(doc);
    }

    public List<DocumentChunk> searchRelevantChunks(String orgId, String query, int topK) {
        List<DocumentChunk> allChunks = documentChunkRepository.findByOrganizationId(orgId);
        if (allChunks.isEmpty()) return Collections.emptyList();

        float[] queryVector = generateVectorEmbedding(query);

        List<AbstractMap.SimpleEntry<DocumentChunk, Double>> scored = new ArrayList<>();
        for (DocumentChunk chunk : allChunks) {
            float[] chunkVector = parseVector(chunk.getEmbeddingJson());
            double score = cosineSimilarity(queryVector, chunkVector);
            scored.add(new AbstractMap.SimpleEntry<>(chunk, score));
        }

        scored.sort((a, b) -> Double.compare(b.getValue(), a.getValue()));
        return scored.stream().limit(topK).map(AbstractMap.SimpleEntry::getKey).toList();
    }

    private String extractText(MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            String name = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
            if (name.endsWith(".pdf")) {
                try (PDDocument pdfDoc = org.apache.pdfbox.Loader.loadPDF(is.readAllBytes())) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    return stripper.getText(pdfDoc);
                }
            } else {
                return new String(is.readAllBytes(), StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            log.error("Text extraction failed: {}", e.getMessage());
            throw new BadRequestException("Failed to read document text: " + e.getMessage());
        }
    }

    private List<String> chunkText(String text, int chunkSize, int overlap) {
        List<String> chunks = new ArrayList<>();
        int length = text.length();
        int start = 0;

        while (start < length) {
            int end = Math.min(start + chunkSize, length);
            chunks.add(text.substring(start, end).trim());
            if (end == length) break;
            start = end - overlap;
        }
        return chunks;
    }

    private float[] generateVectorEmbedding(String text) {
        float[] vector = new float[128];
        String normalized = text.toLowerCase();
        for (int i = 0; i < normalized.length(); i++) {
            char c = normalized.charAt(i);
            int index = (c * 31 + i * 17) % 128;
            vector[Math.abs(index)] += 1.0f;
        }
        // Normalize vector
        float norm = 0.0f;
        for (float v : vector) norm += v * v;
        norm = (float) Math.sqrt(norm);
        if (norm > 0) {
            for (int i = 0; i < vector.length; i++) vector[i] /= norm;
        }
        return vector;
    }

    private float[] parseVector(String json) {
        if (json == null || json.isBlank()) return new float[128];
        try {
            List<Double> list = objectMapper.readValue(json, new TypeReference<>() {});
            float[] res = new float[list.size()];
            for (int i = 0; i < list.size(); i++) res[i] = list.get(i).floatValue();
            return res;
        } catch (Exception e) {
            return new float[128];
        }
    }

    private double cosineSimilarity(float[] v1, float[] v2) {
        if (v1.length != v2.length) return 0.0;
        double dot = 0.0, normA = 0.0, normB = 0.0;
        for (int i = 0; i < v1.length; i++) {
            dot += v1[i] * v2[i];
            normA += v1[i] * v1[i];
            normB += v2[i] * v2[i];
        }
        return (normA == 0 || normB == 0) ? 0.0 : (dot / (Math.sqrt(normA) * Math.sqrt(normB)));
    }
}
