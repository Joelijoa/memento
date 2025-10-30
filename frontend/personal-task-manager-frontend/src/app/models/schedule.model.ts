export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
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
