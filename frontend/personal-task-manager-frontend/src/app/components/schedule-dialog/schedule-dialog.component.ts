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
import { Schedule, DayOfWeek } from '../../models/schedule.model';

export interface ScheduleDialogData {
  schedule?: Schedule;
  isEdit?: boolean;
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
    MatIconModule
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
      this.scheduleForm.patchValue(this.data.schedule);
    }
  }

  private initForm(): void {
    this.scheduleForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dayOfWeek: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      isWorkSchedule: [false]
    });
  }

  onSave(): void {
    if (this.scheduleForm.valid) {
      const scheduleData = this.scheduleForm.value;
      this.dialogRef.close(scheduleData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
