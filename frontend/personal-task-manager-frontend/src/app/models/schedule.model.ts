export enum DayOfWeek {
  MONDAY = 'Lundi',
  TUESDAY = 'Mardi',
  WEDNESDAY = 'Mercredi',
  THURSDAY = 'Jeudi',
  FRIDAY = 'Vendredi',
  SATURDAY = 'Samedi',
  SUNDAY = 'Dimanche'
}

export interface Schedule {
  id?: number;
  dayOfWeek: DayOfWeek;
  date?: string; // Date au format YYYY-MM-DD
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  isWorkSchedule: boolean;
  createdAt?: string;
  updatedAt?: string;
}
