package com.cybergate.auth.service;

import com.cybergate.auth.dto.UserDTO;
import com.cybergate.auth.exception.UserNotFoundException;
import com.cybergate.auth.model.Role;
import com.cybergate.auth.model.User;
import com.cybergate.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserDTO> listUsers() {
        return userRepository.findAll().stream()
                .filter(User::isActive)
                .map(u -> new UserDTO(u.getId(), u.getUsername(), u.getEmail(), u.getFullName(), u.getRole()))
                .toList();
    }

    public UserDTO getUserById(UUID id) {
        User user = userRepository.findById(id)
                .filter(User::isActive)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + id));
        return new UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getFullName(), user.getRole());
    }

    public UserDTO updateUserRole(UUID id, Role role) {
        User user = userRepository.findById(id)
                .filter(User::isActive)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + id));
        user.setRole(role);
        user = userRepository.save(user);
        return new UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getFullName(), user.getRole());
    }

    public void deleteUser(UUID id) {
        User user = userRepository.findById(id)
                .filter(User::isActive)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + id));
        user.setActive(false);
        userRepository.save(user);
    }
}
