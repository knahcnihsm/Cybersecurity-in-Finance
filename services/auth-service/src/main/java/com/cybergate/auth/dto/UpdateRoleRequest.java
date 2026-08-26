package com.cybergate.auth.dto;

import com.cybergate.auth.model.Role;

public record UpdateRoleRequest(
        Role role
) {}
