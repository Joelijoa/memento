package com.personaltaskmanager.service;

import com.personaltaskmanager.model.User;
import com.personaltaskmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

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

    public void requestPasswordReset(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
            return;
        }

        User user = userOpt.get();
        
        // Générer un code de 6 chiffres
        String resetCode = generateResetCode();
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(15);
        
        user.setResetCode(resetCode);
        user.setResetCodeExpiry(expiryTime);
        userRepository.save(user);
        
        // Envoyer l'email
        emailService.sendResetCode(user.getEmail(), resetCode);
    }

    public void resetPassword(String email, String resetCode, String newPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Email introuvable");
        }

        User user = userOpt.get();
        
        // Vérifier le code
        if (user.getResetCode() == null || !user.getResetCode().equals(resetCode)) {
            throw new IllegalArgumentException("Code de réinitialisation invalide");
        }
        
        // Vérifier l'expiration
        if (user.getResetCodeExpiry() == null || user.getResetCodeExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Code de réinitialisation expiré");
        }
        
        // Réinitialiser le mot de passe
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetCode(null);
        user.setResetCodeExpiry(null);
        userRepository.save(user);
    }

    public boolean verifyResetCode(String email, String resetCode) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();
        
        // Vérifier le code
        if (user.getResetCode() == null || !user.getResetCode().equals(resetCode)) {
            return false;
        }
        
        // Vérifier l'expiration
        if (user.getResetCodeExpiry() == null || user.getResetCodeExpiry().isBefore(LocalDateTime.now())) {
            return false;
        }
        
        return true;
    }

    private String generateResetCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // Code entre 100000 et 999999
        return String.valueOf(code);
    }
}

