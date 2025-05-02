package com.personaltaskmanager.controller;

import com.personaltaskmanager.model.Note;
import com.personaltaskmanager.enums.NoteType;
import com.personaltaskmanager.service.NoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {
    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public List<Note> getAllNotes() {
        return noteService.getAllNotes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Note> getNoteById(@PathVariable Long id) {
        Note note = noteService.getNoteById(id);
        return note != null ? ResponseEntity.ok(note) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public Note createNote(@RequestBody Note note) {
        return noteService.createNote(note);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable Long id, @RequestBody Note note) {
        Note updatedNote = noteService.updateNote(id, note);
        return updatedNote != null ? ResponseEntity.ok(updatedNote) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/toggle-pin")
    public ResponseEntity<Note> togglePin(@PathVariable Long id) {
        Note updatedNote = noteService.togglePin(id);
        return updatedNote != null ? ResponseEntity.ok(updatedNote) : ResponseEntity.notFound().build();
    }

    @GetMapping("/pinned")
    public List<Note> getPinnedNotes() {
        return noteService.getPinnedNotes();
    }

    @GetMapping("/type/{type}")
    public List<Note> getNotesByType(@PathVariable NoteType type) {
        return noteService.getNotesByType(type);
    }
} 