export interface Schedule {
  id?: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  isWorkSchedule?: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId?: number;
}
