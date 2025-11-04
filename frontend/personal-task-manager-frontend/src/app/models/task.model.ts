export enum TaskStatus {
  PENDING = 'En attente',
  IN_PROGRESS = 'En cours',
  COMPLETED = 'Terminé'
}

export enum TaskDifficulty {
  EASY = 'Facile',
  MEDIUM = 'Moyen',
  HARD = 'Difficile'
}

export enum TaskPriority {
  LOW = 'Faible',
  MEDIUM = 'Moyen',
  HIGH = 'Élevé',
  URGENT = 'Urgent'
}

export interface Comment {
  id?: number;
  content: string;
  authorName: string;
  filePath?: string;
  fileName?: string;
  files?: FileAttachment[];
  createdAt?: string;
  taskId?: number;
}

export interface FileAttachment {
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface Task {
  id?: number;
  title: string;
  description?: string;
  status: TaskStatus;
  difficulty: TaskDifficulty;
  priority: TaskPriority;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: number;
  comments?: Comment[];
  isOverdue?: boolean;
}
