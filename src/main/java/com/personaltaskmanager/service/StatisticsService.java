package com.personaltaskmanager.service;

import com.personaltaskmanager.model.Statistics;
import com.personaltaskmanager.model.Task;
import com.personaltaskmanager.model.Note;
import com.personaltaskmanager.repository.StatisticsRepository;
import com.personaltaskmanager.repository.TaskRepository;
import com.personaltaskmanager.repository.NoteRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatisticsService {
    private final StatisticsRepository statisticsRepository;
    private final TaskRepository taskRepository;
    private final NoteRepository noteRepository;

    public StatisticsService(StatisticsRepository statisticsRepository, 
                           TaskRepository taskRepository, 
                           NoteRepository noteRepository) {
        this.statisticsRepository = statisticsRepository;
        this.taskRepository = taskRepository;
        this.noteRepository = noteRepository;
    }

    public Statistics getStatisticsByDate(LocalDate date) {
        // Calculer les statistiques en temps réel
        return calculateStatisticsForDate(date);
    }

    public List<Statistics> getAllStatistics() {
        return statisticsRepository.findAll();
    }

    public Statistics getStatisticsById(Long id) {
        return statisticsRepository.findById(id).orElse(null);
    }

    public List<Statistics> getStatisticsBetweenDates(LocalDate startDate, LocalDate endDate) {
        return statisticsRepository.findByDateBetween(startDate, endDate);
    }

    public Map<String, Object> getDashboardData() {
        LocalDate today = LocalDate.now();
        LocalDate weekAgo = today.minusDays(7);
        
        Map<String, Object> dashboard = new HashMap<>();
        
        // Statistiques d'aujourd'hui
        Statistics todayStats = calculateStatisticsForDate(today);
        dashboard.put("todayStats", todayStats);
        
        // Statistiques des 7 derniers jours
        List<Map<String, Object>> last7Days = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            Statistics dayStats = calculateStatisticsForDate(date);
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            dayData.put("dayName", date.getDayOfWeek().toString().substring(0, 3));
            dayData.put("tasksCompleted", dayStats.getTasksCompleted());
            dayData.put("notesCreated", dayStats.getNotesCreated());
            dayData.put("productiveTimeMinutes", dayStats.getProductiveTimeMinutes());
            last7Days.add(dayData);
        }
        dashboard.put("last7Days", last7Days);
        
        // Répartition des tâches par difficulté
        Map<String, Long> difficultyStats = taskRepository.findAll().stream()
            .collect(Collectors.groupingBy(
                task -> task.getDifficulty().toString(),
                Collectors.counting()
            ));
        dashboard.put("difficultyStats", difficultyStats);
        
        // Répartition des notes par type
        Map<String, Long> noteTypeStats = noteRepository.findAll().stream()
            .collect(Collectors.groupingBy(
                note -> note.getType().toString(),
                Collectors.counting()
            ));
        dashboard.put("noteTypeStats", noteTypeStats);
        
        return dashboard;
    }

    private Statistics calculateStatisticsForDate(LocalDate date) {
        Statistics stats = new Statistics();
        stats.setDate(date);
        
        // Tâches complétées aujourd'hui
        List<Task> completedTasks = taskRepository.findByStatusAndCreatedAtBetween(
            com.personaltaskmanager.enums.TaskStatus.COMPLETED,
            date.atStartOfDay(),
            date.plusDays(1).atStartOfDay()
        );
        stats.setTasksCompleted(completedTasks.size());
        
        // Notes créées aujourd'hui
        List<Note> notesToday = noteRepository.findByCreatedAtBetween(
            date.atStartOfDay(),
            date.plusDays(1).atStartOfDay()
        );
        stats.setNotesCreated(notesToday.size());
        
        // Temps productif (estimation basée sur les tâches complétées)
        int productiveTime = completedTasks.stream()
            .mapToInt(task -> {
                switch (task.getDifficulty()) {
                    case EASY: return 30; // 30 minutes par tâche facile
                    case MEDIUM: return 60; // 1 heure par tâche moyenne
                    case HARD: return 120; // 2 heures par tâche difficile
                    default: return 45;
                }
            })
            .sum();
        stats.setProductiveTimeMinutes(productiveTime);
        
        // Répartition des tâches par difficulté (JSON)
        Map<String, Long> difficultyMap = completedTasks.stream()
            .collect(Collectors.groupingBy(
                task -> task.getDifficulty().toString(),
                Collectors.counting()
            ));
        stats.setTasksByDifficulty(mapToJson(difficultyMap));
        
        // Répartition des notes par type (JSON)
        Map<String, Long> noteTypeMap = notesToday.stream()
            .collect(Collectors.groupingBy(
                note -> note.getType().toString(),
                Collectors.counting()
            ));
        stats.setNotesByType(mapToJson(noteTypeMap));
        
        return stats;
    }

    private String mapToJson(Map<String, Long> map) {
        StringBuilder json = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Long> entry : map.entrySet()) {
            if (!first) json.append(",");
            json.append("\"").append(entry.getKey()).append("\":").append(entry.getValue());
            first = false;
        }
        json.append("}");
        return json.toString();
    }

    public Statistics createStatistics(Statistics statistics) {
        return statisticsRepository.save(statistics);
    }

    public Statistics updateStatistics(Long id, Statistics statistics) {
        if (statisticsRepository.existsById(id)) {
            statistics.setId(id);
            return statisticsRepository.save(statistics);
        }
        return null;
    }

    public void deleteStatistics(Long id) {
        statisticsRepository.deleteById(id);
    }
}