package com.personaltaskmanager.model;

import com.personaltaskmanager.enums.TaskStatus;
import com.personaltaskmanager.enums.TaskDifficulty;
import com.personaltaskmanager.enums.TaskPriority;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;

@Data
@Entity
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TaskStatus status = TaskStatus.PENDING;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TaskDifficulty difficulty;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TaskPriority priority = TaskPriority.MEDIUM;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "user_id")
    private Long userId;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Comment> comments = new ArrayList<>();

    // Méthode pour vérifier si la tâche est en retard
    public boolean isOverdue() {
        return dueDate != null && dueDate.isBefore(LocalDate.now()) && status != TaskStatus.COMPLETED;
    }
} 