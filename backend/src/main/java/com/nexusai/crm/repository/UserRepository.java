package com.nexusai.crm.repository;

import com.nexusai.crm.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByIdAndOrganizationId(String id, String organizationId);
    Page<User> findByOrganizationId(String organizationId, Pageable pageable);
    List<User> findByOrganizationId(String organizationId);
    boolean existsByOrganizationIdAndEmail(String organizationId, String email);
    boolean existsByEmail(String email);
}
