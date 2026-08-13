package com.nexusai.crm.controller;

import com.nexusai.crm.dto.PageResponse;
import com.nexusai.crm.dto.TaskDto;
import com.nexusai.crm.security.SecurityUtils;
import com.nexusai.crm.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<PageResponse<TaskDto.TaskResponse>> getTasks(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(taskService.getTasks(orgId, PageRequest.of(page, size, Sort.by("dueDate").ascending())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDto.TaskResponse> getTask(@PathVariable("id") String id) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(taskService.getTask(orgId, id));
    }

    @PostMapping
    public ResponseEntity<TaskDto.TaskResponse> createTask(@Valid @RequestBody TaskDto.CreateTaskRequest request) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(orgId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDto.TaskResponse> updateTask(
            @PathVariable("id") String id,
            @RequestBody TaskDto.UpdateTaskRequest request) {
        String orgId = SecurityUtils.getCurrentOrgId();
        return ResponseEntity.ok(taskService.updateTask(orgId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable("id") String id) {
        String orgId = SecurityUtils.getCurrentOrgId();
        taskService.deleteTask(orgId, id);
        return ResponseEntity.noContent().build();
    }
}
