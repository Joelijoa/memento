package com.personaltaskmanager.controller;

import com.personaltaskmanager.model.Statistics;
import com.personaltaskmanager.service.StatisticsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {
    private final StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<Statistics> getStatisticsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Statistics statistics = statisticsService.getStatisticsByDate(date);
        return statistics != null ? ResponseEntity.ok(statistics) : ResponseEntity.notFound().build();
    }

    @GetMapping("/range")
    public List<Statistics> getStatisticsBetweenDates(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return statisticsService.getStatisticsBetweenDates(startDate, endDate);
    }

    @PostMapping
    public Statistics createStatistics(@RequestBody Statistics statistics) {
        return statisticsService.createStatistics(statistics);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Statistics> updateStatistics(@PathVariable Long id, @RequestBody Statistics statistics) {
        Statistics updatedStatistics = statisticsService.updateStatistics(id, statistics);
        return updatedStatistics != null ? ResponseEntity.ok(updatedStatistics) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStatistics(@PathVariable Long id) {
        statisticsService.deleteStatistics(id);
        return ResponseEntity.ok().build();
    }
} 