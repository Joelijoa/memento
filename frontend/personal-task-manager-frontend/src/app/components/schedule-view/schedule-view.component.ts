import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScheduleService } from '../../services/schedule.service';
import { Schedule, DayOfWeek } from '../../models/schedule.model';
import { ScheduleDialogComponent, ScheduleDialogData } from '../schedule-dialog/schedule-dialog.component';

@Component({
  selector: 'app-schedule-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './schedule-view.component.html',
  styleUrl: './schedule-view.component.scss'
})
export class ScheduleViewComponent implements OnInit {
  schedules: Schedule[] = [];
  weekDays = [
    { name: 'Lundi', value: DayOfWeek.MONDAY },
    { name: 'Mardi', value: DayOfWeek.TUESDAY },
    { name: 'Mercredi', value: DayOfWeek.WEDNESDAY },
    { name: 'Jeudi', value: DayOfWeek.THURSDAY },
    { name: 'Vendredi', value: DayOfWeek.FRIDAY },
    { name: 'Samedi', value: DayOfWeek.SATURDAY },
    { name: 'Dimanche', value: DayOfWeek.SUNDAY }
  ];

  constructor(
    private scheduleService: ScheduleService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.scheduleService.getAllSchedules().subscribe({
      next: (schedules) => {
        this.schedules = schedules;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des plannings:', error);
      }
    });
  }

  getSchedulesForDay(dayOfWeek: DayOfWeek): Schedule[] {
    return this.schedules.filter(schedule => schedule.dayOfWeek === dayOfWeek);
  }

  openAddScheduleDialog(): void {
    const dialogRef = this.dialog.open(ScheduleDialogComponent, {
      width: '650px',
      panelClass: 'schedule-dialog',
      data: { isEdit: false } as ScheduleDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createSchedule(result);
      }
    });
  }

  editSchedule(schedule: Schedule): void {
    const dialogRef = this.dialog.open(ScheduleDialogComponent, {
      width: '650px',
      panelClass: 'schedule-dialog',
      data: { schedule: schedule, isEdit: true } as ScheduleDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateSchedule(schedule.id!, result);
      }
    });
  }

  deleteSchedule(schedule: Schedule): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce planning ?')) {
      this.scheduleService.deleteSchedule(schedule.id!).subscribe({
        next: () => {
          this.schedules = this.schedules.filter(s => s.id !== schedule.id);
          this.snackBar.open('Planning supprimé', 'Fermer', { duration: 2000 });
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  private createSchedule(scheduleData: any): void {
    this.scheduleService.createSchedule(scheduleData).subscribe({
      next: (newSchedule) => {
        this.schedules.push(newSchedule);
        this.snackBar.open('Planning créé avec succès', 'Fermer', { duration: 2000 });
      },
      error: (error) => {
        console.error('Erreur lors de la création:', error);
        this.snackBar.open('Erreur lors de la création', 'Fermer', { duration: 3000 });
      }
    });
  }

  private updateSchedule(id: number, scheduleData: any): void {
    this.scheduleService.updateSchedule(id, scheduleData).subscribe({
      next: (updatedSchedule) => {
        const index = this.schedules.findIndex(s => s.id === id);
        if (index !== -1) {
          this.schedules[index] = updatedSchedule;
        }
        this.snackBar.open('Planning modifié avec succès', 'Fermer', { duration: 2000 });
      },
      error: (error) => {
        console.error('Erreur lors de la modification:', error);
        this.snackBar.open('Erreur lors de la modification', 'Fermer', { duration: 3000 });
      }
    });
  }
}
