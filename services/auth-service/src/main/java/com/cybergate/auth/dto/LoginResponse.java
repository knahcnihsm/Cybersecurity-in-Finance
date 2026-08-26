package com.cybergate.auth.dto;

public record LoginResponse(
        String token,
        String refreshToken,
        long expiresIn,
        UserDTO user
) {}
