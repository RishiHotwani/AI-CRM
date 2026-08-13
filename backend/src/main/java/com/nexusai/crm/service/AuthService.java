package com.nexusai.crm.service;

import com.nexusai.crm.dto.AuthDto;
import com.nexusai.crm.dto.OrganizationDto;
import com.nexusai.crm.dto.UserDto;
import com.nexusai.crm.entity.Organization;
import com.nexusai.crm.entity.RefreshToken;
import com.nexusai.crm.entity.User;
import com.nexusai.crm.entity.VerificationToken;
import com.nexusai.crm.entity.enums.Role;
import com.nexusai.crm.entity.enums.Tier;
import com.nexusai.crm.entity.enums.TokenType;
import com.nexusai.crm.exception.BadRequestException;
import com.nexusai.crm.exception.ResourceNotFoundException;
import com.nexusai.crm.repository.OrganizationRepository;
import com.nexusai.crm.repository.RefreshTokenRepository;
import com.nexusai.crm.repository.UserRepository;
import com.nexusai.crm.repository.VerificationTokenRepository;
import com.nexusai.crm.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final TenantService tenantService;
    private final NotificationService notificationService;

    @Transactional
    public AuthDto.AuthResponse signUp(AuthDto.SignUpRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with email " + request.getEmail() + " already exists");
        }

        String slug = request.getCompanyName().toLowerCase().replaceAll("[^a-z0-9]", "-") + "-" + UUID.randomUUID().toString().substring(0, 5);

        Organization org = Organization.builder()
                .name(request.getCompanyName())
                .slug(slug)
                .tier(Tier.PRO)
                .build();
        org = organizationRepository.save(org);

        User user = User.builder()
                .organization(org)
                .email(request.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .jobTitle(request.getJobTitle() != null ? request.getJobTitle() : "Owner")
                .role(Role.OWNER)
                .emailVerified(false)
                .build();
        user = userRepository.save(user);

        tenantService.createDefaultPipeline(org);

        // Generate email verification token
        String verifyToken = UUID.randomUUID().toString();
        VerificationToken vt = VerificationToken.builder()
                .user(user)
                .token(verifyToken)
                .tokenType(TokenType.EMAIL_VERIFY)
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();
        verificationTokenRepository.save(vt);

        notificationService.createNotification(org, user, "Welcome to NexusAI CRM", "Your workspace has been created. Please verify your email to unlock all features.", "SUCCESS", "/settings");

        String accessToken = jwtProvider.generateAccessToken(user);
        String refreshToken = jwtProvider.generateRefreshToken(user);

        saveRefreshToken(user, refreshToken);

        return AuthDto.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapUserResponse(user))
                .organization(mapOrgResponse(org))
                .build();
    }

    @Transactional
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password");
        }

        String accessToken = jwtProvider.generateAccessToken(user);
        String refreshTokenStr = jwtProvider.generateRefreshToken(user);

        saveRefreshToken(user, refreshTokenStr);

        return AuthDto.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .user(mapUserResponse(user))
                .organization(mapOrgResponse(user.getOrganization()))
                .build();
    }

    @Transactional
    public AuthDto.AuthResponse refreshToken(AuthDto.RefreshTokenRequest request) {
        RefreshToken token = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired refresh token"));

        if (token.isRevoked() || token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Refresh token has expired or been revoked");
        }

        User user = token.getUser();
        token.setRevoked(true);
        refreshTokenRepository.save(token);

        String newAccessToken = jwtProvider.generateAccessToken(user);
        String newRefreshTokenStr = jwtProvider.generateRefreshToken(user);

        saveRefreshToken(user, newRefreshTokenStr);

        return AuthDto.AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshTokenStr)
                .user(mapUserResponse(user))
                .organization(mapOrgResponse(user.getOrganization()))
                .build();
    }

    @Transactional
    public void forgotPassword(AuthDto.ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail().toLowerCase()).ifPresent(user -> {
            verificationTokenRepository.deleteByUserIdAndTokenType(user.getId(), TokenType.PASSWORD_RESET);
            String token = UUID.randomUUID().toString();
            VerificationToken vt = VerificationToken.builder()
                    .user(user)
                    .token(token)
                    .tokenType(TokenType.PASSWORD_RESET)
                    .expiresAt(LocalDateTime.now().plusHours(2))
                    .build();
            verificationTokenRepository.save(vt);
            log.info("Password reset token generated for user {}: {}", user.getEmail(), token);
        });
    }

    @Transactional
    public void resetPassword(AuthDto.ResetPasswordRequest request) {
        VerificationToken vt = verificationTokenRepository.findByTokenAndTokenType(request.getToken(), TokenType.PASSWORD_RESET)
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token"));

        if (vt.getUsedAt() != null || vt.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Password reset token has expired or already been used");
        }

        User user = vt.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        vt.setUsedAt(LocalDateTime.now());
        verificationTokenRepository.save(vt);

        // Revoke existing refresh tokens
        refreshTokenRepository.deleteByUserId(user.getId());
    }

    @Transactional
    public void verifyEmail(String token) {
        VerificationToken vt = verificationTokenRepository.findByTokenAndTokenType(token, TokenType.EMAIL_VERIFY)
                .orElseThrow(() -> new BadRequestException("Invalid verification token"));

        if (vt.getUsedAt() != null || vt.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Verification token has expired or already been used");
        }

        User user = vt.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        vt.setUsedAt(LocalDateTime.now());
        verificationTokenRepository.save(vt);
    }

    private void saveRefreshToken(User user, String tokenStr) {
        RefreshToken token = RefreshToken.builder()
                .user(user)
                .token(tokenStr)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .build();
        refreshTokenRepository.save(token);
    }

    public UserDto.UserResponse mapUserResponse(User user) {
        return UserDto.UserResponse.builder()
                .id(user.getId())
                .organizationId(user.getOrganization().getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .jobTitle(user.getJobTitle())
                .role(user.getRole())
                .emailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public OrganizationDto.OrganizationResponse mapOrgResponse(Organization org) {
        return OrganizationDto.OrganizationResponse.builder()
                .id(org.getId())
                .name(org.getName())
                .slug(org.getSlug())
                .tier(org.getTier())
                .createdAt(org.getCreatedAt())
                .build();
    }
}
