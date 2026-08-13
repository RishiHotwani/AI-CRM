package com.nexusai.crm.repository;

import com.nexusai.crm.entity.VerificationToken;
import com.nexusai.crm.entity.enums.TokenType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, String> {
    Optional<VerificationToken> findByTokenAndTokenType(String token, TokenType tokenType);
    void deleteByUserIdAndTokenType(String userId, TokenType tokenType);
}
