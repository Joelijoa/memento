package com.personaltaskmanager.dto;

import com.personaltaskmanager.enums.TaskDifficulty;
import com.personaltaskmanager.enums.TaskPriority;
import com.personaltaskmanager.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/**
 * DTO pour la création et la mise à jour de tâches
 * Le userId n'est pas inclus car il est extrait du token/header
 */
@Data
public class TaskDTO {
    @NotBlank(message = "Le titre est obligatoire")
    private String title;

    private String description;

    @NotNull(message = "Le statut est obligatoire")
    private TaskStatus status;

    @NotNull(message = "La difficulté est obligatoire")
    private TaskDifficulty difficulty;

    @NotNull(message = "La priorité est obligatoire")
    private TaskPriority priority;

    private LocalDate dueDate;
}

