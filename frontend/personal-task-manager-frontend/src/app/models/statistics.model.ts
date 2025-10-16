export interface Statistics {
  id?: number;
  date: string;
  productiveTimeMinutes: number;
  tasksCompleted: number;
  notesCreated: number;
  tasksByDifficulty?: string; // JSON string
  notesByType?: string; // JSON string
}

export interface TaskDifficultyStats {
  EASY: number;
  MEDIUM: number;
  HARD: number;
}

export interface NoteTypeStats {
  TEXT: number;
  VOICE: number;
  IMAGE: number;
}
