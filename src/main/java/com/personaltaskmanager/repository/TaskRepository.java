package com.personaltaskmanager.repository;

import com.personaltaskmanager.model.Task;
import com.personaltaskmanager.enums.TaskStatus;
import com.personaltaskmanager.enums.TaskDifficulty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByStatus(TaskStatus status);
    List<Task> findByDifficulty(TaskDifficulty difficulty);
} 