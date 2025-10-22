package com.personaltaskmanager.controller;

import com.personaltaskmanager.model.Note;
import com.personaltaskmanager.enums.NoteType;
import com.personaltaskmanager.service.NoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = {"http://localhost:4200", "http://192.168.1.34:4200"})
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

    @PostMapping("/with-audio")
    public Note createNoteWithAudio(
            @RequestParam("note") String noteJson,
            @RequestParam("audioFile") MultipartFile audioFile) {
        return noteService.createNoteWithAudio(noteJson, audioFile);
    }

    @GetMapping("/audio/{filename}")
    public ResponseEntity<Resource> getAudioFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get("uploads/audio/" + filename);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                String contentType = "audio/webm";
                if (filename.endsWith(".mp3")) {
                    contentType = "audio/mpeg";
                } else if (filename.endsWith(".wav")) {
                    contentType = "audio/wav";
                }
                
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
} 