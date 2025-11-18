package com.personaltaskmanager.service;

import com.personaltaskmanager.model.Task;
import com.personaltaskmanager.enums.TaskStatus;
import com.personaltaskmanager.enums.TaskDifficulty;
import com.personaltaskmanager.exception.ResourceNotFoundException;
import com.personaltaskmanager.exception.UnauthorizedException;
import com.personaltaskmanager.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TaskService {
    private static final Logger logger = LoggerFactory.getLogger(TaskService.class);
    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    /**
     * Récupère toutes les tâches d'un utilisateur spécifique
     */
    public List<Task> getTasksByUserId(Long userId) {
        logger.debug("Récupération des tâches pour l'utilisateur {}", userId);
        return taskRepository.findByUserId(userId);
    }

    /**
     * Récupère une tâche par son ID en vérifiant qu'elle appartient à l'utilisateur
     */
    public Task getTaskById(Long id, Long userId) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tâche non trouvée avec l'ID: " + id));
        
        if (!task.getUserId().equals(userId)) {
            throw new UnauthorizedException("Vous n'avez pas accès à cette tâche");
        }
        
        return task;
    }

    /**
     * Crée une nouvelle tâche pour l'utilisateur spécifié
     */
    public Task createTask(Task task, Long userId) {
        logger.info("Création d'une nouvelle tâche pour l'utilisateur {}", userId);
        task.setUserId(userId);
        return taskRepository.save(task);
    }

    /**
     * Met à jour une tâche en vérifiant qu'elle appartient à l'utilisateur
     */
    public Task updateTask(Long id, Task task, Long userId) {
        Task existingTask = getTaskById(id, userId);
        
        // Vérifier que l'utilisateur ne change pas le userId
        if (task.getUserId() != null && !task.getUserId().equals(userId)) {
            throw new UnauthorizedException("Vous ne pouvez pas modifier le propriétaire de la tâche");
        }
        
        existingTask.setTitle(task.getTitle());
        existingTask.setDescription(task.getDescription());
        existingTask.setStatus(task.getStatus());
        existingTask.setDifficulty(task.getDifficulty());
        existingTask.setPriority(task.getPriority());
        existingTask.setDueDate(task.getDueDate());
        existingTask.setUpdatedAt(java.time.LocalDateTime.now());
        
        logger.info("Mise à jour de la tâche {} pour l'utilisateur {}", id, userId);
        return taskRepository.save(existingTask);
    }

    /**
     * Supprime une tâche en vérifiant qu'elle appartient à l'utilisateur
     */
    public void deleteTask(Long id, Long userId) {
        Task task = getTaskById(id, userId);
        logger.info("Suppression de la tâche {} pour l'utilisateur {}", id, userId);
        taskRepository.delete(task);
    }

    /**
     * Met à jour le statut d'une tâche en vérifiant qu'elle appartient à l'utilisateur
     */
    public Task updateTaskStatus(Long id, TaskStatus status, Long userId) {
        Task task = getTaskById(id, userId);
        task.setStatus(status);
        task.setUpdatedAt(java.time.LocalDateTime.now());
        logger.info("Mise à jour du statut de la tâche {} pour l'utilisateur {}", id, userId);
        return taskRepository.save(task);
    }

    /**
     * Récupère les tâches par statut pour un utilisateur spécifique
     */
    public List<Task> getTasksByStatus(TaskStatus status, Long userId) {
        logger.debug("Récupération des tâches avec statut {} pour l'utilisateur {}", status, userId);
        return taskRepository.findByStatusAndUserId(status, userId);
    }

    /**
     * Récupère les tâches par difficulté pour un utilisateur spécifique
     */
    public List<Task> getTasksByDifficulty(TaskDifficulty difficulty, Long userId) {
        logger.debug("Récupération des tâches avec difficulté {} pour l'utilisateur {}", difficulty, userId);
        return taskRepository.findByDifficultyAndUserId(difficulty, userId);
    }
} 