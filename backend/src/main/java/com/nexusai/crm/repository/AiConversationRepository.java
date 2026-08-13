package com.nexusai.crm.repository;

import com.nexusai.crm.entity.AiConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AiConversationRepository extends JpaRepository<AiConversation, String> {
    List<AiConversation> findByOrganizationIdAndUserIdOrderByCreatedAtDesc(String orgId, String userId);
    Optional<AiConversation> findByIdAndOrganizationId(String id, String organizationId);
}
