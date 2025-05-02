package com.personaltaskmanager.service;

import com.personaltaskmanager.model.Schedule;
import com.personaltaskmanager.repository.ScheduleRepository;
import org.springframework.stereotype.Service;
import java.time.DayOfWeek;
import java.util.List;

@Service
public class ScheduleService {
    private final ScheduleRepository scheduleRepository;

    public ScheduleService(ScheduleRepository scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }

    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    public Schedule getScheduleById(Long id) {
        return scheduleRepository.findById(id).orElse(null);
    }

    public Schedule createSchedule(Schedule schedule) {
        return scheduleRepository.save(schedule);
    }

    public Schedule updateSchedule(Long id, Schedule schedule) {
        if (scheduleRepository.existsById(id)) {
            schedule.setId(id);
            return scheduleRepository.save(schedule);
        }
        return null;
    }

    public void deleteSchedule(Long id) {
        scheduleRepository.deleteById(id);
    }

    public List<Schedule> getSchedulesByDay(DayOfWeek dayOfWeek) {
        return scheduleRepository.findByDayOfWeek(dayOfWeek);
    }

    public List<Schedule> getWorkSchedules(boolean isWorkSchedule) {
        return scheduleRepository.findByIsWorkSchedule(isWorkSchedule);
    }
} 