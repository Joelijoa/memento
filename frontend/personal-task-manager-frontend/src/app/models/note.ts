export interface Note {
  id?: number;
  title: string;
  content?: string;
  isPinned?: boolean;
  type?: string;
  mediaPath?: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: number;
}
