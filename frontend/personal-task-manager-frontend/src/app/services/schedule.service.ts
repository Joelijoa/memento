import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Schedule } from '../models/schedule.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private apiUrl = 'http://localhost:8080/api/schedules';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }
  
  private addUserId(schedule: any): any {
    const user = this.authService.getCurrentUser();
    if (user && user.id) {
      schedule.userId = user.id;
    }
    return schedule;
  }

  getAllSchedules(): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(this.apiUrl);
  }

  getScheduleById(id: number): Observable<Schedule> {
    return this.http.get<Schedule>(`${this.apiUrl}/${id}`);
  }

  createSchedule(schedule: Schedule): Observable<Schedule> {
    const scheduleWithUserId = this.addUserId(schedule);
    return this.http.post<Schedule>(this.apiUrl, scheduleWithUserId);
  }

  updateSchedule(id: number, schedule: Schedule): Observable<Schedule> {
    return this.http.put<Schedule>(`${this.apiUrl}/${id}`, schedule);
  }

  deleteSchedule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getSchedulesByDay(dayOfWeek: string): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${this.apiUrl}/day/${dayOfWeek}`);
  }
}