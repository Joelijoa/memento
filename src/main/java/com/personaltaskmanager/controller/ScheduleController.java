package com.personaltaskmanager.controller;

import com.personaltaskmanager.model.Schedule;
import com.personaltaskmanager.service.ScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.DayOfWeek;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin(origins = {"http://localhost:4200", "http://192.168.1.34:4200"})
public class ScheduleController {
    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping
    public List<Schedule> getAllSchedules() {
        return scheduleService.getAllSchedules();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Schedule> getScheduleById(@PathVariable Long id) {
        Schedule schedule = scheduleService.getScheduleById(id);
        return schedule != null ? ResponseEntity.ok(schedule) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public Schedule createSchedule(@RequestBody Schedule schedule) {
        return scheduleService.createSchedule(schedule);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Schedule> updateSchedule(@PathVariable Long id, @RequestBody Schedule schedule) {
        Schedule updatedSchedule = scheduleService.updateSchedule(id, schedule);
        return updatedSchedule != null ? ResponseEntity.ok(updatedSchedule) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/day/{dayOfWeek}")
    public List<Schedule> getSchedulesByDay(@PathVariable DayOfWeek dayOfWeek) {
        return scheduleService.getSchedulesByDay(dayOfWeek);
    }

    @GetMapping("/work/{isWorkSchedule}")
    public List<Schedule> getWorkSchedules(@PathVariable boolean isWorkSchedule) {
        return scheduleService.getWorkSchedules(isWorkSchedule);
    }
} 