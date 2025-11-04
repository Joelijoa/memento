export enum DocumentType {
  FOLDER = 'FOLDER',
  FILE = 'FILE'
}

export enum FileType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  PDF = 'PDF',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  OTHER = 'OTHER'
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  fileType?: FileType;
  parentId?: string;
  content?: string; // Pour les fichiers texte
  fileUrl?: string; // Pour les fichiers uploadés
  size?: number;
  mimeType?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

