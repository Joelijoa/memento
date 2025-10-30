import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { TaskService } from './task.service';
import { ScheduleService } from './schedule.service';
import { Task } from '../models/task.model';
import { Schedule } from '../models/schedule.model';

export interface Notification {
  id: string;
  type: 'task' | 'schedule' | 'SCHEDULE' | 'TASK' | string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  entityId?: number;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  private readonly NOTIFICATION_KEY = 'notifications';
  private checkInterval: any;

  constructor(
    private taskService: TaskService,
    private scheduleService: ScheduleService
  ) {
    this.loadNotifications();
    this.startChecking();
  }

  private startChecking(): void {
    // Vérifier toutes les 5 minutes
    this.checkInterval = setInterval(() => {
      this.checkForNotifications();
    }, 5 * 60 * 1000);
    
    // Vérifier immédiatement
    this.checkForNotifications();
  }

  getNotifications(): Observable<Notification[]> {
    return this.notifications$;
  }

  getUnreadCount(): Observable<number> {
    return this.notifications$.pipe(
      map(notifications => notifications.filter(n => !n.read).length)
    );
  }

  checkForNotificationsNow(): void {
    this.checkForNotifications();
  }

  private checkForNotifications(): void {
    const now = new Date();
    
    combineLatest([
      this.taskService.getAllTasks(),
      this.scheduleService.getAllSchedules()
    ]).subscribe(([tasks, schedules]) => {
      const notifications: Notification[] = [];

      // Vérifier les tâches
      tasks.forEach(task => {
        if (task.dueDate && task.status !== 'COMPLETED' && task.id) {
          const dueDate = new Date(task.dueDate);
          const timeDiff = dueDate.getTime() - now.getTime();
          const isToday = this.isSameDay(dueDate, now);
          const isTomorrow = this.isSameDay(dueDate, this.getTomorrow(now));

          // Notification le jour même (si l'échéance n'est pas encore passée)
          if (isToday && timeDiff > 0) {
            notifications.push({
              id: `task-${task.id}-today`,
              type: 'task',
              title: `Tâche "${task.title}" expire aujourd'hui !`,
              message: `La tâche expire aujourd'hui à ${this.formatTime(dueDate)}`,
              priority: 'high',
              timestamp: new Date(),
              entityId: task.id,
              read: false
            });
          }
          // Notification un jour à l'avance (seulement si ce n'est pas aujourd'hui)
          else if (isTomorrow && timeDiff > 0) {
            notifications.push({
              id: `task-${task.id}-tomorrow`,
              type: 'task',
              title: `Tâche "${task.title}" expire demain`,
              message: `La tâche expire demain à ${this.formatTime(dueDate)}`,
              priority: 'medium',
              timestamp: new Date(),
              entityId: task.id,
              read: false
            });
          }
        }
      });

      // Vérifier les plannings
      schedules.forEach(schedule => {
        if (schedule.startTime && schedule.id) {
          // Calculer la prochaine occurrence du planning
          const nextOccurrence = this.getNextScheduleOccurrence(schedule, now);
          if (!nextOccurrence) return;

          const timeDiff = nextOccurrence.getTime() - now.getTime();
          const isToday = this.isSameDay(nextOccurrence, now);
          const isTomorrow = this.isSameDay(nextOccurrence, this.getTomorrow(now));

          // Notification le jour même (si le planning n'a pas encore commencé)
          if (isToday && timeDiff > 0) {
            notifications.push({
              id: `schedule-${schedule.id}-today-${nextOccurrence.getTime()}`,
              type: 'schedule',
              title: `Planning "${schedule.title}" aujourd'hui`,
              message: `Le planning commence aujourd'hui à ${this.formatTime(nextOccurrence)}`,
              priority: 'high',
              timestamp: new Date(),
              entityId: schedule.id,
              read: false
            });
          }
          // Notification un jour à l'avance (seulement si ce n'est pas aujourd'hui)
          else if (isTomorrow && timeDiff > 0) {
            notifications.push({
              id: `schedule-${schedule.id}-tomorrow-${nextOccurrence.getTime()}`,
              type: 'schedule',
              title: `Planning "${schedule.title}" demain`,
              message: `Le planning commence demain à ${this.formatTime(nextOccurrence)}`,
              priority: 'medium',
              timestamp: new Date(),
              entityId: schedule.id,
              read: false
            });
          }
        }
      });

      // Fusionner avec les notifications existantes (éviter les doublons)
      const existingNotifications = this.notificationsSubject.value;
      const newNotifications = notifications.filter(newNotif => 
        !existingNotifications.some(existing => existing.id === newNotif.id)
      );

      if (newNotifications.length > 0) {
        const allNotifications = [...existingNotifications, ...newNotifications]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 50); // Limiter à 50 notifications
        
        this.notificationsSubject.next(allNotifications);
        this.saveNotifications();
      }
    });
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  private getTomorrow(date: Date): Date {
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  private getNextScheduleOccurrence(schedule: Schedule, now: Date): Date | null {
    // Mapping : JavaScript getDay() : 0=Sunday, 1=Monday, ..., 6=Saturday
    const dayMapping: { [key: string]: number } = {
      'SUNDAY': 0,
      'MONDAY': 1,
      'TUESDAY': 2,
      'WEDNESDAY': 3,
      'THURSDAY': 4,
      'FRIDAY': 5,
      'SATURDAY': 6
    };
    
    const currentDayIndex = now.getDay();
    const scheduleDayIndex = dayMapping[schedule.dayOfWeek] ?? 0;
    
    // Parser l'heure du planning (format HH:mm ou ISO)
    let scheduleTime: Date;
    try {
      // Si c'est une date ISO complète
      if (schedule.startTime.includes('T')) {
        scheduleTime = new Date(schedule.startTime);
      } else {
        // Si c'est juste l'heure (HH:mm)
        const [hours, minutes] = schedule.startTime.split(':').map(Number);
        scheduleTime = new Date(now);
        scheduleTime.setHours(hours, minutes || 0, 0, 0);
      }
    } catch {
      return null;
    }

    // Calculer les jours jusqu'au prochain jour de la semaine du planning
    let daysUntilScheduleDay = scheduleDayIndex - currentDayIndex;
    
    // Si le jour est dans le passé cette semaine, prendre la semaine prochaine
    if (daysUntilScheduleDay < 0) {
      daysUntilScheduleDay += 7;
    }

    // Créer la date de la prochaine occurrence
    const nextOccurrence = new Date(now);
    nextOccurrence.setDate(now.getDate() + daysUntilScheduleDay);
    
    // Extraire l'heure et les minutes du planning
    let scheduleHours = 0;
    let scheduleMinutes = 0;
    
    if (schedule.startTime.includes('T')) {
      const scheduleDate = new Date(schedule.startTime);
      scheduleHours = scheduleDate.getHours();
      scheduleMinutes = scheduleDate.getMinutes();
    } else {
      const [hours, minutes] = schedule.startTime.split(':').map(Number);
      scheduleHours = hours || 0;
      scheduleMinutes = minutes || 0;
    }
    
    nextOccurrence.setHours(scheduleHours, scheduleMinutes, 0, 0);

    // Si c'est aujourd'hui mais l'heure est passée, prendre la semaine prochaine
    if (daysUntilScheduleDay === 0 && nextOccurrence.getTime() <= now.getTime()) {
      nextOccurrence.setDate(nextOccurrence.getDate() + 7);
    }

    return nextOccurrence;
  }

  markAsRead(notificationId: string): void {
    const notifications = this.notificationsSubject.value.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(notifications);
    this.saveNotifications();
  }

  markAllAsRead(): void {
    const notifications = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(notifications);
    this.saveNotifications();
  }

  deleteNotification(notificationId: string): void {
    const notifications = this.notificationsSubject.value.filter(n => n.id !== notificationId);
    this.notificationsSubject.next(notifications);
    this.saveNotifications();
  }

  clearAllNotifications(): void {
    this.notificationsSubject.next([]);
    localStorage.removeItem(this.NOTIFICATION_KEY);
  }

  private loadNotifications(): void {
    try {
      const stored = localStorage.getItem(this.NOTIFICATION_KEY);
      if (stored) {
        const notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        this.notificationsSubject.next(notifications);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
  }

  private saveNotifications(): void {
    try {
      localStorage.setItem(this.NOTIFICATION_KEY, JSON.stringify(this.notificationsSubject.value));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notifications:', error);
    }
  }

  createNotification(notification: Omit<Notification, 'id' | 'timestamp'>): Observable<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: `custom-${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    };
    
    const existingNotifications = this.notificationsSubject.value;
    const allNotifications = [newNotification, ...existingNotifications]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50);
    
    this.notificationsSubject.next(allNotifications);
    this.saveNotifications();
    
    return new Observable(observer => {
      observer.next(newNotification);
      observer.complete();
    });
  }

  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

