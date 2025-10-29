import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { NoteService } from '../../services/note.service';
import { Note, NoteType } from '../../models/note.model';
import { NoteDialogComponent, NoteDialogData } from '../note-dialog/note-dialog.component';
import { AudioPlayerComponent } from '../audio-player/audio-player.component';

@Component({
  selector: 'app-note-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule,
    MatCheckboxModule,
    AudioPlayerComponent
  ],
  templateUrl: './note-list.component.html',
  styleUrl: './note-list.component.scss'
})
export class NoteListComponent implements OnInit {
  notes: Note[] = [];
  filteredNotes: Note[] = [];
  selectedType = '';
  searchTerm = '';
  showPinnedOnly = false;

  constructor(
    private noteService: NoteService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes(): void {
    this.noteService.getAllNotes().subscribe({
      next: (notes) => {
        this.notes = notes;
        this.filteredNotes = [...notes];
      },
      error: (error) => {
        console.error('Erreur lors du chargement des notes:', error);
        this.snackBar.open('Erreur lors du chargement des notes', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  filterNotes(): void {
    this.filteredNotes = this.notes.filter(note => {
      const matchesType = !this.selectedType || note.type === this.selectedType;
      const matchesSearch = !this.searchTerm || 
        note.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (note.content && note.content.toLowerCase().includes(this.searchTerm.toLowerCase()));
      const matchesPinned = !this.showPinnedOnly || note.isPinned;
      
      return matchesType && matchesSearch && matchesPinned;
    });
  }

  openAddNoteDialog(): void {
    const dialogRef = this.dialog.open(NoteDialogComponent, {
      width: '600px',
      panelClass: 'note-dialog',
      data: { isEdit: false } as NoteDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createNote(result);
      }
    });
  }

  editNote(note: Note): void {
    const dialogRef = this.dialog.open(NoteDialogComponent, {
      width: '600px',
      panelClass: 'note-dialog',
      data: { note: note, isEdit: true } as NoteDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateNote(note.id!, result);
      }
    });
  }

  private createNote(noteData: any): void {
    const audioFile = noteData.audioFile;
    delete noteData.audioFile; // Retirer le fichier audio des données de la note
    
    this.noteService.createNote(noteData, audioFile).subscribe({
      next: (newNote) => {
        this.notes.push(newNote);
        this.filterNotes();
        this.snackBar.open('Note créée avec succès', 'Fermer', { duration: 2000 });
      },
      error: (error) => {
        console.error('Erreur lors de la création:', error);
        this.snackBar.open('Erreur lors de la création', 'Fermer', { duration: 3000 });
      }
    });
  }

  private updateNote(id: number, noteData: any): void {
    this.noteService.updateNote(id, noteData).subscribe({
      next: (updatedNote) => {
        const index = this.notes.findIndex(n => n.id === id);
        if (index !== -1) {
          this.notes[index] = updatedNote;
          this.filterNotes();
        }
        this.snackBar.open('Note modifiée avec succès', 'Fermer', { duration: 2000 });
      },
      error: (error) => {
        console.error('Erreur lors de la modification:', error);
        this.snackBar.open('Erreur lors de la modification', 'Fermer', { duration: 3000 });
      }
    });
  }

  togglePin(note: Note): void {
    this.noteService.togglePin(note.id!).subscribe({
      next: (updatedNote) => {
        const index = this.notes.findIndex(n => n.id === note.id);
        if (index !== -1) {
          this.notes[index] = updatedNote;
          this.filterNotes();
        }
        this.snackBar.open(
          updatedNote.isPinned ? 'Note épinglée' : 'Note désépinglée', 
          'Fermer', 
          { duration: 2000 }
        );
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
        this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { duration: 3000 });
      }
    });
  }

  deleteNote(note: Note): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      this.noteService.deleteNote(note.id!).subscribe({
        next: () => {
          this.notes = this.notes.filter(n => n.id !== note.id);
          this.filterNotes();
          this.snackBar.open('Note supprimée', 'Fermer', { duration: 2000 });
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  getTypeLabel(type: NoteType): string {
    switch (type) {
      case NoteType.TEXT: return 'Texte';
      case NoteType.VOICE: return 'Vocal';
      case NoteType.IMAGE: return 'Image';
      default: return type;
    }
  }

  getTypeColor(type: NoteType): string {
    switch (type) {
      case NoteType.TEXT: return 'primary';
      case NoteType.VOICE: return 'accent';
      case NoteType.IMAGE: return 'warn';
      default: return 'primary';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  getAudioUrl(mediaPath: string): string {
    if (!mediaPath) return '';
    return `http://localhost:8080/api/notes/audio/${mediaPath}`;
  }
}
