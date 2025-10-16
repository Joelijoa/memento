import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Note, NoteType } from '../../models/note.model';

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
    MatCheckboxModule
  ],
  templateUrl: './note-dialog.component.html',
  styleUrl: './note-dialog.component.scss'
})
export class NoteDialogComponent implements OnInit {
  noteForm!: FormGroup;
  isEdit = false;

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

  onSave(): void {
    if (this.noteForm.valid) {
      const noteData = this.noteForm.value;
      this.dialogRef.close(noteData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
