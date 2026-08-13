package com.nexusai.crm.controller;

import com.nexusai.crm.dto.AuthDto;
import com.nexusai.crm.dto.UserDto;
import com.nexusai.crm.entity.User;
import com.nexusai.crm.repository.UserRepository;
import com.nexusai.crm.security.SecurityUtils;
import com.nexusai.crm.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/signup")
    public ResponseEntity<AuthDto.AuthResponse> signUp(@Valid @RequestBody AuthDto.SignUpRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.signUp(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthResponse> login(@Valid @RequestBody AuthDto.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthDto.AuthResponse> refreshToken(@Valid @RequestBody AuthDto.RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    /**
     * Token validation endpoint — called by the frontend on page load to verify
     * the stored JWT is still valid. Returns the current user and organization info.
     */
    @GetMapping("/me")
    public ResponseEntity<AuthDto.AuthResponse> getCurrentUser() {
        String userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.nexusai.crm.exception.ResourceNotFoundException("User not found"));

        return ResponseEntity.ok(AuthDto.AuthResponse.builder()
                .accessToken("") // Don't re-issue token here, just return user info
                .refreshToken("")
                .user(authService.mapUserResponse(user))
                .organization(authService.mapOrgResponse(user.getOrganization()))
                .build());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody AuthDto.ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(Map.of("message", "If an account exists for this email, a password-reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody AuthDto.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password has been successfully reset. Please log in with your new password."));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestParam("token") String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(Map.of("message", "Email verified successfully."));
    }
}
