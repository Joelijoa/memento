import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Note } from '../models/note.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private apiUrl = 'http://localhost:8080/api/notes';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }
  
  private addUserId(note: any): any {
    const user = this.authService.getCurrentUser();
    if (user && user.id) {
      note.userId = user.id;
    }
    return note;
  }

  getAllNotes(): Observable<Note[]> {
    return this.http.get<Note[]>(this.apiUrl);
  }

  getNoteById(id: number): Observable<Note> {
    return this.http.get<Note>(`${this.apiUrl}/${id}`);
  }

  createNote(note: Note, audioFile?: Blob): Observable<Note> {
    const noteWithUserId = this.addUserId(note);
    if (audioFile && note.type === 'VOICE') {
      return this.createNoteWithAudio(noteWithUserId, audioFile);
    }
    return this.http.post<Note>(this.apiUrl, noteWithUserId);
  }

  private createNoteWithAudio(note: Note, audioFile: Blob): Observable<Note> {
    const formData = new FormData();
    formData.append('note', JSON.stringify(note));
    formData.append('audioFile', audioFile, 'recording.webm');
    
    return this.http.post<Note>(`${this.apiUrl}/with-audio`, formData);
  }

  updateNote(id: number, note: Note): Observable<Note> {
    return this.http.put<Note>(`${this.apiUrl}/${id}`, note);
  }

  deleteNote(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  togglePin(id: number): Observable<Note> {
    return this.http.patch<Note>(`${this.apiUrl}/${id}/pin`, {});
  }

  getPinnedNotes(): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl}/pinned`);
  }
}