package com.personaltaskmanager.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "statistics")
public class Statistics {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date", nullable = false)
    private LocalDate date = LocalDate.now();

    @Column(name = "productive_time_minutes")
    private Integer productiveTimeMinutes = 0;

    @Column(name = "tasks_completed")
    private Integer tasksCompleted = 0;

    @Column(name = "notes_created")
    private Integer notesCreated = 0;

    @Column(name = "tasks_by_difficulty")
    private String tasksByDifficulty; // Format JSON: {"EASY": 5, "MEDIUM": 3, "HARD": 1}

    @Column(name = "notes_by_type")
    private String notesByType; // Format JSON: {"TEXT": 10, "VOICE": 2, "IMAGE": 3}
} 