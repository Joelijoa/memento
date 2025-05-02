package com.personaltaskmanager.service;

import com.personaltaskmanager.model.Statistics;
import com.personaltaskmanager.repository.StatisticsRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class StatisticsService {
    private final StatisticsRepository statisticsRepository;

    public StatisticsService(StatisticsRepository statisticsRepository) {
        this.statisticsRepository = statisticsRepository;
    }

    public Statistics getStatisticsByDate(LocalDate date) {
        return statisticsRepository.findByDateBetween(date, date)
                .stream()
                .findFirst()
                .orElse(null);
    }

    public List<Statistics> getStatisticsBetweenDates(LocalDate startDate, LocalDate endDate) {
        return statisticsRepository.findByDateBetween(startDate, endDate);
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