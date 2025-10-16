import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Task, TaskStatus, TaskPriority, Comment } from '../../models/task.model';

export interface TaskDetailData {
  task: Task;
}

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss'
})
export class TaskDetailComponent implements OnInit {
  task!: Task;

  constructor(
    private dialogRef: MatDialogRef<TaskDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskDetailData
  ) {
    this.task = data.task;
  }

  ngOnInit(): void {
    // Charger les commentaires si nécessaire
  }

  getStatusLabel(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.PENDING: return 'À faire';
      case TaskStatus.IN_PROGRESS: return 'En cours';
      case TaskStatus.COMPLETED: return 'Terminée';
      default: return status;
    }
  }

  getPriorityLabel(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.LOW: return 'Faible';
      case TaskPriority.MEDIUM: return 'Moyenne';
      case TaskPriority.HIGH: return 'Élevée';
      case TaskPriority.URGENT: return 'Urgente';
      default: return priority;
    }
  }

  getDifficultyLabel(difficulty: string): string {
    switch (difficulty) {
      case 'EASY': return 'Facile';
      case 'MEDIUM': return 'Moyenne';
      case 'HARD': return 'Difficile';
      default: return difficulty;
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  downloadFile(file: any): void {
    // Simuler le téléchargement
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  }

  viewFile(file: any): void {
    if (file.type.startsWith('image/')) {
      // Ouvrir l'image dans une nouvelle fenêtre
      window.open(file.url, '_blank');
    } else if (file.type === 'application/pdf') {
      // Ouvrir le PDF dans une nouvelle fenêtre
      window.open(file.url, '_blank');
    } else {
      // Télécharger le fichier
      this.downloadFile(file);
    }
  }

  getFileIcon(type: string): string {
    if (type.startsWith('image/')) return 'image';
    if (type === 'application/pdf') return 'picture_as_pdf';
    if (type.startsWith('video/')) return 'video_file';
    if (type.startsWith('audio/')) return 'audio_file';
    return 'insert_drive_file';
  }

  close(): void {
    this.dialogRef.close();
  }
}
