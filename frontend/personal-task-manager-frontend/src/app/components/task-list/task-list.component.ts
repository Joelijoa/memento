import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus, TaskDifficulty, TaskPriority, Comment } from '../../models/task.model';
import { TaskDialogComponent, TaskDialogData } from '../task-dialog/task-dialog.component';
import { CommentDialogComponent, CommentDialogData } from '../comment-dialog/comment-dialog.component';
import { TaskDetailComponent, TaskDetailData } from '../task-detail/task-detail.component';
import { CommentService } from '../../services/comment.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  selectedStatus = '';
  selectedDifficulty = '';
  searchTerm = '';

  constructor(
    private taskService: TaskService,
    private commentService: CommentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.filteredTasks = [...tasks];
      },
      error: (error) => {
        console.error('Erreur lors du chargement des tâches:', error);
        this.snackBar.open('Erreur lors du chargement des tâches', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  filterTasks(): void {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesStatus = !this.selectedStatus || task.status === this.selectedStatus;
      const matchesDifficulty = !this.selectedDifficulty || task.difficulty === this.selectedDifficulty;
      const matchesSearch = !this.searchTerm || 
        task.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      return matchesStatus && matchesDifficulty && matchesSearch;
    });
  }

  openAddTaskDialog(): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '500px',
      data: { isEdit: false } as TaskDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createTask(result);
      }
    });
  }

  editTask(task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '500px',
      data: { task: task, isEdit: true } as TaskDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateTask(task.id!, result);
      }
    });
  }

  private createTask(taskData: any): void {
    this.taskService.createTask(taskData).subscribe({
      next: (newTask) => {
        this.tasks.push(newTask);
        this.filterTasks();
        this.snackBar.open('Tâche créée avec succès', 'Fermer', { duration: 2000 });
      },
      error: (error) => {
        console.error('Erreur lors de la création:', error);
        this.snackBar.open('Erreur lors de la création', 'Fermer', { duration: 3000 });
      }
    });
  }

  private updateTask(id: number, taskData: any): void {
    this.taskService.updateTask(id, taskData).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
          this.filterTasks();
        }
        this.snackBar.open('Tâche modifiée avec succès', 'Fermer', { duration: 2000 });
      },
      error: (error) => {
        console.error('Erreur lors de la modification:', error);
        this.snackBar.open('Erreur lors de la modification', 'Fermer', { duration: 3000 });
      }
    });
  }

  toggleTaskStatus(task: Task): void {
    let newStatus: TaskStatus;
    switch (task.status) {
      case TaskStatus.PENDING:
        newStatus = TaskStatus.IN_PROGRESS;
        break;
      case TaskStatus.IN_PROGRESS:
        newStatus = TaskStatus.COMPLETED;
        break;
      case TaskStatus.COMPLETED:
        newStatus = TaskStatus.PENDING;
        break;
      default:
        newStatus = TaskStatus.PENDING;
    }

    this.taskService.updateTaskStatus(task.id!, newStatus).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
          this.filterTasks();
        }
        this.snackBar.open('Statut mis à jour', 'Fermer', { duration: 2000 });
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
        this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { duration: 3000 });
      }
    });
  }

  deleteTask(task: Task): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      this.taskService.deleteTask(task.id!).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== task.id);
          this.filterTasks();
          this.snackBar.open('Tâche supprimée', 'Fermer', { duration: 2000 });
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  getStatusLabel(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.PENDING: return 'En attente';
      case TaskStatus.IN_PROGRESS: return 'En cours';
      case TaskStatus.COMPLETED: return 'Terminée';
      default: return status;
    }
  }

  getDifficultyLabel(difficulty: TaskDifficulty): string {
    switch (difficulty) {
      case TaskDifficulty.EASY: return 'Facile';
      case TaskDifficulty.MEDIUM: return 'Moyenne';
      case TaskDifficulty.HARD: return 'Difficile';
      default: return difficulty;
    }
  }

  getStatusColor(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.PENDING: return 'warn';
      case TaskStatus.IN_PROGRESS: return 'accent';
      case TaskStatus.COMPLETED: return 'primary';
      default: return 'primary';
    }
  }

  getDifficultyColor(difficulty: TaskDifficulty): string {
    switch (difficulty) {
      case TaskDifficulty.EASY: return 'primary';
      case TaskDifficulty.MEDIUM: return 'accent';
      case TaskDifficulty.HARD: return 'warn';
      default: return 'primary';
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

  isOverdue(task: Task): boolean {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    return dueDate < today && task.status !== TaskStatus.COMPLETED;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  openCommentDialog(task: Task): void {
    const dialogRef = this.dialog.open(CommentDialogComponent, {
      width: '500px',
      data: { taskId: task.id } as CommentDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.commentService.createComment(result).subscribe({
          next: (comment) => {
            if (!task.comments) task.comments = [];
            task.comments.unshift(comment);
            this.snackBar.open('Commentaire ajouté avec succès', 'Fermer', {
              duration: 3000
            });
          },
          error: (error) => {
            console.error('Erreur lors de l\'ajout du commentaire:', error);
            this.snackBar.open('Erreur lors de l\'ajout du commentaire', 'Fermer', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  openStatusMenu(task: Task): void {
    // Pour l'instant, on utilise la méthode existante
    this.toggleTaskStatus(task);
  }

  openTaskDetail(task: Task): void {
    const dialogRef = this.dialog.open(TaskDetailComponent, {
      width: '90vw',
      maxWidth: '800px',
      maxHeight: '90vh',
      data: { task } as TaskDetailData
    });
  }

  getStatusIcon(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.PENDING: return 'play_arrow';
      case TaskStatus.IN_PROGRESS: return 'pause';
      case TaskStatus.COMPLETED: return 'refresh';
      default: return 'help';
    }
  }

  getTaskCardClass(task: Task): string {
    return `task-${task.status.toLowerCase().replace('_', '-')}`;
  }

}
