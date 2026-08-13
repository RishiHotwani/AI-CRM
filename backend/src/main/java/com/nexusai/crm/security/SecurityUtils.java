package com.nexusai.crm.security;

import com.nexusai.crm.entity.User;
import com.nexusai.crm.exception.TenantAccessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUser();
        }
        throw new TenantAccessException("User is not authenticated");
    }

    public static String getCurrentOrgId() {
        String orgId = TenantContext.getCurrentTenant();
        if (orgId == null) {
            User user = getAuthenticatedUser();
            return user.getOrganization().getId();
        }
        return orgId;
    }

    public static String getCurrentUserId() {
        return getAuthenticatedUser().getId();
    }

    public static String getCurrentUserEmail() {
        return getAuthenticatedUser().getEmail();
    }
}
