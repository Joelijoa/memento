package com.personaltaskmanager.controller;

import com.personaltaskmanager.model.Task;
import com.personaltaskmanager.enums.TaskStatus;
import com.personaltaskmanager.service.TaskService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = {"http://localhost:4200", "http://192.168.1.34:4200"})
public class TaskController {
    private static final Logger logger = LoggerFactory.getLogger(TaskController.class);
    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * Récupère toutes les tâches de l'utilisateur connecté
     * TODO: Remplacer par extraction du userId depuis le JWT token
     */
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            logger.warn("Tentative d'accès sans userId dans le header");
            return ResponseEntity.badRequest().build();
        }
        List<Task> tasks = taskService.getTasksByUserId(userId);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Récupère une tâche par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            logger.warn("Tentative d'accès sans userId dans le header");
            return ResponseEntity.badRequest().build();
        }
        Task task = taskService.getTaskById(id, userId);
        return ResponseEntity.ok(task);
    }

    /**
     * Crée une nouvelle tâche
     */
    @PostMapping
    public ResponseEntity<Task> createTask(
            @Valid @RequestBody Task task,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            logger.warn("Tentative de création sans userId dans le header");
            return ResponseEntity.badRequest().build();
        }
        Task createdTask = taskService.createTask(task, userId);
        return ResponseEntity.ok(createdTask);
    }

    /**
     * Met à jour une tâche
     */
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody Task task,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            logger.warn("Tentative de mise à jour sans userId dans le header");
            return ResponseEntity.badRequest().build();
        }
        Task updatedTask = taskService.updateTask(id, task, userId);
        return ResponseEntity.ok(updatedTask);
    }

    /**
     * Supprime une tâche
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            logger.warn("Tentative de suppression sans userId dans le header");
            return ResponseEntity.badRequest().build();
        }
        taskService.deleteTask(id, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Met à jour le statut d'une tâche
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(
            @PathVariable Long id,
            @RequestParam TaskStatus status,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            logger.warn("Tentative de mise à jour du statut sans userId dans le header");
            return ResponseEntity.badRequest().build();
        }
        Task updatedTask = taskService.updateTaskStatus(id, status, userId);
        return ResponseEntity.ok(updatedTask);
    }

    /**
     * Récupère les tâches par statut pour l'utilisateur connecté
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Task>> getTasksByStatus(
            @PathVariable TaskStatus status,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            logger.warn("Tentative d'accès sans userId dans le header");
            return ResponseEntity.badRequest().build();
        }
        List<Task> tasks = taskService.getTasksByStatus(status, userId);
        return ResponseEntity.ok(tasks);
    }
} 