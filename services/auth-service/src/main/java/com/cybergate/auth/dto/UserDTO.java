package com.cybergate.auth.dto;

import com.cybergate.auth.model.Role;

import java.util.UUID;

public record UserDTO(
        UUID id,
        String username,
        String email,
        String fullName,
        Role role
) {}
