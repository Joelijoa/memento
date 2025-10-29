import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Task, TaskStatus, TaskDifficulty, TaskPriority } from '../../models/task.model';

export interface TaskDialogData {
  task?: Task;
  isEdit?: boolean;
}

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './task-dialog.component.html',
  styleUrl: './task-dialog.component.scss'
})
export class TaskDialogComponent implements OnInit {
  taskForm!: FormGroup;
  isEdit = false;
  
  // Enums pour les options des selects
  TaskStatus = TaskStatus;
  TaskDifficulty = TaskDifficulty;
  TaskPriority = TaskPriority;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskDialogData
  ) {
    this.isEdit = data.isEdit || false;
  }

  ngOnInit(): void {
    this.initForm();
    
    if (this.isEdit && this.data.task) {
      this.taskForm.patchValue(this.data.task);
    }
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      status: [TaskStatus.PENDING],
      difficulty: ['', Validators.required],
      priority: [TaskPriority.MEDIUM, Validators.required],
      dueDate: ['']
    });
  }

  onSave(): void {
    if (this.taskForm.valid) {
      const taskData = this.taskForm.value;
      this.dialogRef.close(taskData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
