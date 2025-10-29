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

