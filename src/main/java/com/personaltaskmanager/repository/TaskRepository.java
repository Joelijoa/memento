package com.personaltaskmanager.repository;

import com.personaltaskmanager.model.Task;
import com.personaltaskmanager.enums.TaskStatus;
import com.personaltaskmanager.enums.TaskDifficulty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByStatus(TaskStatus status);
    List<Task> findByDifficulty(TaskDifficulty difficulty);
    List<Task> findByUserId(Long userId);
    List<Task> findByStatusAndUserId(TaskStatus status, Long userId);
    List<Task> findByDifficultyAndUserId(TaskDifficulty difficulty, Long userId);
    
    @Query("SELECT t FROM Task t WHERE t.status = :status AND t.createdAt BETWEEN :startDate AND :endDate")
    List<Task> findByStatusAndCreatedAtBetween(@Param("status") TaskStatus status, 
                                             @Param("startDate") LocalDateTime startDate, 
                                             @Param("endDate") LocalDateTime endDate);
} 