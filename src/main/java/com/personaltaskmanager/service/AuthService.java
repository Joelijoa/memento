package com.personaltaskmanager.service;

import com.personaltaskmanager.model.User;
import com.personaltaskmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User register(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Ce nom d'utilisateur est déjà utilisé");
        }
        
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Cet email est déjà utilisé");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }

    public User authenticate(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Identifiants incorrects");
        }

        User user = userOpt.get();
        
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Identifiants incorrects");
        }

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return user;
    }

    public String generateToken(User user) {
        return UUID.randomUUID().toString();
    }
}

