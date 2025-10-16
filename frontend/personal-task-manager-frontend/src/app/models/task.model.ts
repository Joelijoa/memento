export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export enum TaskDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
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
  comments?: Comment[];
  isOverdue?: boolean;
}
