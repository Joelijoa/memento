package com.personaltaskmanager.repository;

import com.personaltaskmanager.model.Statistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface StatisticsRepository extends JpaRepository<Statistics, Long> {
    List<Statistics> findByDateBetween(LocalDate startDate, LocalDate endDate);
    List<Statistics> findByDate(LocalDate date);
} 