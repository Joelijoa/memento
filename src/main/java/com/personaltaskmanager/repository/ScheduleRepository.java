package com.personaltaskmanager.repository;

import com.personaltaskmanager.model.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.DayOfWeek;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByDayOfWeek(DayOfWeek dayOfWeek);
    List<Schedule> findByIsWorkSchedule(boolean isWorkSchedule);
    List<Schedule> findByUserId(Long userId);
    List<Schedule> findByDayOfWeekAndUserId(DayOfWeek dayOfWeek, Long userId);
} 