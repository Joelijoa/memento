import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Schedule, DayOfWeek } from '../../models/schedule.model';

export interface ScheduleDialogData {
  schedule?: Schedule;
  isEdit?: boolean;
  defaultDayOfWeek?: DayOfWeek;
  defaultDate?: Date; // Date pré-sélectionnée depuis le calendrier
}

@Component({
  selector: 'app-schedule-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './schedule-dialog.component.html',
  styleUrl: './schedule-dialog.component.scss'
})
export class ScheduleDialogComponent implements OnInit {
  scheduleForm!: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ScheduleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ScheduleDialogData
  ) {
    this.isEdit = data.isEdit || false;
  }

  ngOnInit(): void {
    this.initForm();
    
    if (this.isEdit && this.data.schedule) {
      const formValue: any = { ...this.data.schedule };
      // Si le schedule a une date, l'utiliser, sinon convertir dayOfWeek en date (semaine courante)
      if (formValue.date) {
        formValue.date = new Date(formValue.date);
      } else if (formValue.dayOfWeek) {
        // Calculer la date de la semaine courante pour ce jour
        const today = new Date();
        const currentDay = today.getDay();
        const targetDay = this.dayOfWeekToNumber(formValue.dayOfWeek);
        const diff = targetDay - currentDay;
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + diff);
        formValue.date = targetDate;
      }
      this.scheduleForm.patchValue(formValue);
    } else if (this.data.defaultDate) {
      this.scheduleForm.patchValue({ date: this.data.defaultDate });
    } else if (this.data.defaultDayOfWeek) {
      // Calculer la date pour le jour de la semaine (semaine courante)
      const today = new Date();
      const currentDay = today.getDay();
      const targetDay = this.dayOfWeekToNumber(this.data.defaultDayOfWeek);
      const diff = targetDay - currentDay;
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + diff);
      this.scheduleForm.patchValue({ date: targetDate });
    }
  }

  private dayOfWeekToNumber(dayOfWeek: DayOfWeek): number {
    const map: Record<DayOfWeek, number> = {
      [DayOfWeek.SUNDAY]: 0,
      [DayOfWeek.MONDAY]: 1,
      [DayOfWeek.TUESDAY]: 2,
      [DayOfWeek.WEDNESDAY]: 3,
      [DayOfWeek.THURSDAY]: 4,
      [DayOfWeek.FRIDAY]: 5,
      [DayOfWeek.SATURDAY]: 6
    };
    return map[dayOfWeek] ?? 1;
  }

  private initForm(): void {
    this.scheduleForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      date: [null, Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      isWorkSchedule: [false]
    });
  }

  onSave(): void {
    if (this.scheduleForm.valid) {
      const scheduleData = { ...this.scheduleForm.value };
      // Convertir la date en format YYYY-MM-DD
      if (scheduleData.date instanceof Date) {
        scheduleData.date = this.formatDateForBackend(scheduleData.date);
        // Calculer aussi dayOfWeek pour compatibilité backend si nécessaire
        scheduleData.dayOfWeek = this.getDayOfWeekFromDate(scheduleData.date);
      }
      this.dialogRef.close(scheduleData);
    }
  }

  private getDayOfWeekFromDate(dateStr: string): DayOfWeek {
    const date = new Date(dateStr);
    const jsDay = date.getDay();
    const map: Record<number, DayOfWeek> = {
      0: DayOfWeek.SUNDAY,
      1: DayOfWeek.MONDAY,
      2: DayOfWeek.TUESDAY,
      3: DayOfWeek.WEDNESDAY,
      4: DayOfWeek.THURSDAY,
      5: DayOfWeek.FRIDAY,
      6: DayOfWeek.SATURDAY
    };
    return map[jsDay] || DayOfWeek.MONDAY;
  }

  private formatDateForBackend(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
