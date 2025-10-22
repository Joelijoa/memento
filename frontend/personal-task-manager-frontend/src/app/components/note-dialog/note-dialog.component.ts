import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { Note, NoteType } from '../../models/note.model';
import { AudioRecorderComponent } from '../audio-recorder/audio-recorder.component';

export interface NoteDialogData {
  note?: Note;
  isEdit?: boolean;
}

@Component({
  selector: 'app-note-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    AudioRecorderComponent
  ],
  templateUrl: './note-dialog.component.html',
  styleUrl: './note-dialog.component.scss'
})
export class NoteDialogComponent implements OnInit {
  noteForm!: FormGroup;
  isEdit = false;
  showAudioRecorder = false;
  audioFile: Blob | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NoteDialogData
  ) {
    this.isEdit = data.isEdit || false;
  }

  ngOnInit(): void {
    this.initForm();
    
    if (this.isEdit && this.data.note) {
      this.noteForm.patchValue(this.data.note);
    }
  }

  private initForm(): void {
    this.noteForm = this.fb.group({
      title: ['', Validators.required],
      content: [''],
      type: [NoteType.TEXT],
      isPinned: [false]
    });
  }

  onTypeChange(event: any): void {
    const selectedType = event.value;
    if (selectedType !== NoteType.VOICE) {
      this.showAudioRecorder = false;
      this.audioFile = null;
    }
  }

  toggleAudioRecorder(): void {
    this.showAudioRecorder = !this.showAudioRecorder;
    if (!this.showAudioRecorder) {
      this.audioFile = null;
    }
  }

  onAudioRecorded(audioBlob: Blob): void {
    this.audioFile = audioBlob;
    this.showAudioRecorder = false;
  }

  onRecordingCancelled(): void {
    this.showAudioRecorder = false;
    this.audioFile = null;
  }

  removeAudio(): void {
    this.audioFile = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onSave(): void {
    if (this.noteForm.valid) {
      const noteData = this.noteForm.value;
      
      // Ajouter le fichier audio si présent
      if (this.audioFile) {
        noteData.audioFile = this.audioFile;
      }
      
      this.dialogRef.close(noteData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
