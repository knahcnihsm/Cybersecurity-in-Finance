package com.cybergate.auth.service;

import com.cybergate.auth.dto.*;
import com.cybergate.auth.model.AuditLog;
import com.cybergate.auth.model.User;
import com.cybergate.auth.repository.AuditLogRepository;
import com.cybergate.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditLogRepository auditLogRepository;

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(user.getUsername());
        String refreshToken = jwtService.generateRefreshToken(user.getUsername());

        auditLog(user.getId(), "LOGIN", "USER", user.getId().toString(), "Successful login");

        return new LoginResponse(
                token,
                refreshToken,
                jwtService.getExpiry(),
                new UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getFullName(), user.getRole())
        );
    }

    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .role(request.role())
                .isActive(true)
                .build();

        user = userRepository.save(user);

        String token = jwtService.generateToken(user.getUsername());
        String refreshToken = jwtService.generateRefreshToken(user.getUsername());

        auditLog(user.getId(), "REGISTER", "USER", user.getId().toString(), "New user registered");

        return new LoginResponse(
                token,
                refreshToken,
                jwtService.getExpiry(),
                new UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getFullName(), user.getRole())
        );
    }

    public LoginResponse refreshToken(RefreshTokenRequest request) {
        String username = jwtService.extractUsername(request.refreshToken());
        if (!jwtService.isTokenValid(request.refreshToken())) {
            throw new RuntimeException("Invalid refresh token");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(user.getUsername());
        String refreshToken = jwtService.generateRefreshToken(user.getUsername());

        return new LoginResponse(
                token,
                refreshToken,
                jwtService.getExpiry(),
                new UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getFullName(), user.getRole())
        );
    }

    private void auditLog(UUID userId, String action, String resourceType, String resourceId, String details) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .action(action)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .details(details)
                .build();
        auditLogRepository.save(log);
    }
}
