package com.personaltaskmanager.service;

import com.personaltaskmanager.model.Note;
import com.personaltaskmanager.enums.NoteType;
import com.personaltaskmanager.repository.NoteRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NoteService {
    private final NoteRepository noteRepository;

    public NoteService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    public List<Note> getAllNotes() {
        return noteRepository.findAll();
    }

    public Note getNoteById(Long id) {
        return noteRepository.findById(id).orElse(null);
    }

    public Note createNote(Note note) {
        return noteRepository.save(note);
    }

    public Note updateNote(Long id, Note note) {
        if (noteRepository.existsById(id)) {
            note.setId(id);
            return noteRepository.save(note);
        }
        return null;
    }

    public void deleteNote(Long id) {
        noteRepository.deleteById(id);
    }

    public Note togglePin(Long id) {
        Note note = noteRepository.findById(id).orElse(null);
        if (note != null) {
            note.setPinned(!note.isPinned());
            return noteRepository.save(note);
        }
        return null;
    }

    public List<Note> getPinnedNotes() {
        return noteRepository.findByIsPinned(true);
    }

    public List<Note> getNotesByType(NoteType type) {
        return noteRepository.findByType(type);
    }
} 