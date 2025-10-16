import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Comment } from '../../models/task.model';

export interface CommentDialogData {
  taskId: number;
  comment?: Comment;
  isEdit?: boolean;
}

@Component({
  selector: 'app-comment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule, // <-- This is incorrect, should be imported from '@angular/material/input'
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './comment-dialog.component.html',
  styleUrl: './comment-dialog.component.scss'
})
export class CommentDialogComponent implements OnInit {
  commentForm!: FormGroup;
  isEdit = false;
  selectedFiles: File[] = [];
  filePreviews: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CommentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CommentDialogData
  ) {
    this.isEdit = data.isEdit || false;
  }

  ngOnInit(): void {
    this.initForm();
    
    if (this.isEdit && this.data.comment) {
      this.commentForm.patchValue(this.data.comment);
    }
  }

  private initForm(): void {
    this.commentForm = this.fb.group({
      content: ['', Validators.required],
      authorName: ['Utilisateur', Validators.required]
    });
  }

  onFilesSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.selectedFiles = [...this.selectedFiles, ...files];
    this.generateFilePreviews();
  }

  generateFilePreviews(): void {
    this.filePreviews = [];
    this.selectedFiles.forEach((file, index) => {
      const preview = {
        file: file,
        id: index,
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        isImage: file.type.startsWith('image/'),
        isPdf: file.type === 'application/pdf'
      };
      this.filePreviews.push(preview);
    });
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.filePreviews.splice(index, 1);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onSave(): void {
    if (this.commentForm.valid) {
      const commentData = {
        ...this.commentForm.value,
        taskId: this.data.taskId,
        files: this.filePreviews.map(preview => ({
          name: preview.name,
          type: preview.type,
          size: preview.size,
          url: preview.url
        }))
      };
      this.dialogRef.close(commentData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
