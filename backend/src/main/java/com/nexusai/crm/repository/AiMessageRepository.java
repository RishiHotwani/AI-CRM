package com.nexusai.crm.repository;

import com.nexusai.crm.entity.AiMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiMessageRepository extends JpaRepository<AiMessage, String> {
    List<AiMessage> findByConversationIdOrderByCreatedAtAsc(String conversationId);
}
