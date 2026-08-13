package com.nexusai.crm.service;

import com.nexusai.crm.dto.PageResponse;
import com.nexusai.crm.dto.UserDto;
import com.nexusai.crm.entity.Organization;
import com.nexusai.crm.entity.User;
import com.nexusai.crm.entity.enums.Role;
import com.nexusai.crm.exception.BadRequestException;
import com.nexusai.crm.exception.ResourceNotFoundException;
import com.nexusai.crm.repository.OrganizationRepository;
import com.nexusai.crm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;

    public PageResponse<UserDto.UserResponse> getOrganizationUsers(String orgId, Pageable pageable) {
        return PageResponse.from(userRepository.findByOrganizationId(orgId, pageable).map(authService::mapUserResponse));
    }

    public List<UserDto.UserResponse> getAllOrganizationUsers(String orgId) {
        return userRepository.findByOrganizationId(orgId).stream().map(authService::mapUserResponse).toList();
    }

    @Transactional
    public UserDto.UserResponse inviteUser(String orgId, UserDto.InviteUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new BadRequestException("User with email " + request.getEmail() + " already exists");
        }

        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        User newUser = User.builder()
                .organization(org)
                .email(request.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                .fullName(request.getFullName())
                .jobTitle(request.getJobTitle() != null ? request.getJobTitle() : "Sales Representative")
                .role(request.getRole() != null ? request.getRole() : Role.SALES_REP)
                .emailVerified(true)
                .build();

        return authService.mapUserResponse(userRepository.save(newUser));
    }

    @Transactional
    public UserDto.UserResponse updateUser(String orgId, String userId, UserDto.UpdateUserRequest request) {
        User user = userRepository.findByIdAndOrganizationId(userId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getJobTitle() != null) user.setJobTitle(request.getJobTitle());
        if (request.getRole() != null) user.setRole(request.getRole());

        return authService.mapUserResponse(userRepository.save(user));
    }
}
