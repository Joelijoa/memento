package com.personaltaskmanager.controller;

import com.personaltaskmanager.model.User;
import com.personaltaskmanager.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:4200", "http://192.168.1.34:4200"})
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            System.out.println("Tentative d'inscription pour: " + user.getUsername());
            User registeredUser = authService.register(user);
            String token = authService.generateToken(registeredUser);

            System.out.println("TONGA ETO PORY");

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", createUserResponse(registeredUser));
            
            System.out.println("Inscription réussie pour: " + user.getUsername());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            System.err.println("Erreur lors de l'inscription: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Erreur inattendue: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Erreur serveur"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String username = credentials.get("username");
            System.out.println("Tentative de connexion pour: " + username);
            
            User user = authService.authenticate(username, credentials.get("password"));
            String token = authService.generateToken(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", createUserResponse(user));
            
            System.out.println("Connexion réussie pour: " + username);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            System.err.println("Erreur lors de la connexion: " + e.getMessage());
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Erreur inattendue: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Erreur serveur"));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "L'email est requis"));
            }
            
            authService.requestPasswordReset(email);
            
            // Pour des raisons de sécurité, on retourne toujours un succès
            // même si l'email n'existe pas
            return ResponseEntity.ok(Map.of("message", "Si cet email existe, un code de réinitialisation a été envoyé"));
        } catch (Exception e) {
            System.err.println("Erreur lors de la demande de réinitialisation: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Erreur serveur"));
        }
    }

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String resetCode = request.get("resetCode");
            
            if (email == null || email.isEmpty() || 
                resetCode == null || resetCode.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "L'email et le code sont requis"));
            }
            
            boolean isValid = authService.verifyResetCode(email, resetCode);
            
            if (isValid) {
                return ResponseEntity.ok(Map.of("valid", true, "message", "Code valide"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("valid", false, "error", "Code invalide ou expiré"));
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de la vérification du code: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Erreur serveur"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String resetCode = request.get("resetCode");
            String newPassword = request.get("newPassword");
            
            if (email == null || email.isEmpty() || 
                resetCode == null || resetCode.isEmpty() ||
                newPassword == null || newPassword.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Tous les champs sont requis"));
            }
            
            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(Map.of("error", "Le mot de passe doit contenir au moins 6 caractères"));
            }
            
            authService.resetPassword(email, resetCode, newPassword);
            
            return ResponseEntity.ok(Map.of("message", "Mot de passe réinitialisé avec succès"));
        } catch (IllegalArgumentException e) {
            System.err.println("Erreur lors de la réinitialisation: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Erreur inattendue: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Erreur serveur"));
        }
    }

    private Map<String, Object> createUserResponse(User user) {
        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("id", user.getId());
        userResponse.put("username", user.getUsername());
        userResponse.put("email", user.getEmail());
        userResponse.put("firstName", user.getFirstName());
        userResponse.put("lastName", user.getLastName());
        return userResponse;
    }
}

