package com.nexusai.crm.service;

import com.nexusai.crm.dto.NotificationDto;
import com.nexusai.crm.entity.Notification;
import com.nexusai.crm.entity.Organization;
import com.nexusai.crm.entity.User;
import com.nexusai.crm.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public void createNotification(Organization org, User user, String title, String message, String type, String link) {
        Notification notification = Notification.builder()
                .organization(org)
                .user(user)
                .title(title)
                .message(message)
                .type(type != null ? type : "INFO")
                .link(link)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    public List<NotificationDto.NotificationResponse> getUnreadNotifications(String orgId, String userId) {
        return notificationRepository.findByOrganizationIdAndUserIdAndIsReadFalseOrderByCreatedAtDesc(orgId, userId)
                .stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public void markAsRead(String orgId, String userId, String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getOrganization().getId().equals(orgId) && n.getUser().getId().equals(userId)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    private NotificationDto.NotificationResponse mapToResponse(Notification n) {
        return NotificationDto.NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .isRead(n.isRead())
                .link(n.getLink())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
