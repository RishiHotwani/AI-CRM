package com.nexusai.crm.controller;

import com.nexusai.crm.dto.PageResponse;
import com.nexusai.crm.dto.UserDto;
import com.nexusai.crm.security.SecurityUtils;
import com.nexusai.crm.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<PageResponse<UserDto.UserResponse>> getUsers(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(userService.getOrganizationUsers(orgId, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserDto.UserResponse>> getAllUsers() {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(userService.getAllOrganizationUsers(orgId));
    }

    @PostMapping("/invite")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<UserDto.UserResponse> inviteUser(@Valid @RequestBody UserDto.InviteUserRequest request) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.inviteUser(orgId, request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<UserDto.UserResponse> updateUser(
            @PathVariable("id") String id,
            @RequestBody UserDto.UpdateUserRequest request) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(userService.updateUser(orgId, id, request));
    }
}
