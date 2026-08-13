package com.nexusai.crm.repository;

import com.nexusai.crm.entity.AiUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiUsageLogRepository extends JpaRepository<AiUsageLog, String> {
    List<AiUsageLog> findByOrganizationIdOrderByCreatedAtDesc(String organizationId);

    @Query("SELECT SUM(a.tokensUsed) FROM AiUsageLog a WHERE a.organization.id = :orgId")
    Long sumTokensUsedByOrganization(String orgId);
}
