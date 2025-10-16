export enum NoteType {
  TEXT = 'TEXT',
  VOICE = 'VOICE',
  IMAGE = 'IMAGE'
}

export interface Note {
  id?: number;
  title: string;
  content?: string;
  isPinned: boolean;
  type: NoteType;
  mediaPath?: string;
  createdAt?: string;
  updatedAt?: string;
}
