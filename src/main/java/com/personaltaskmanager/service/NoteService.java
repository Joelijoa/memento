package com.personaltaskmanager.service;

import com.personaltaskmanager.model.Note;
import com.personaltaskmanager.enums.NoteType;
import com.personaltaskmanager.repository.NoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class NoteService {
    private final NoteRepository noteRepository;
    private final ObjectMapper objectMapper;
    private static final String AUDIO_UPLOAD_DIR = "uploads/audio/";

    public NoteService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
        this.objectMapper = new ObjectMapper();
        createUploadDirectory();
    }

    private void createUploadDirectory() {
        try {
            Path uploadPath = Paths.get(AUDIO_UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            System.err.println("Erreur lors de la création du répertoire d'upload: " + e.getMessage());
        }
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

    public Note createNoteWithAudio(String noteJson, MultipartFile audioFile) {
        try {
            // Parser le JSON de la note
            Note note = objectMapper.readValue(noteJson, Note.class);
            
            // Sauvegarder le fichier audio
            String audioFileName = saveAudioFile(audioFile);
            note.setMediaPath(audioFileName);
            note.setType(NoteType.VOICE);
            
            return noteRepository.save(note);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la création de la note avec audio: " + e.getMessage(), e);
        }
    }

    private String saveAudioFile(MultipartFile audioFile) throws IOException {
        String originalFileName = audioFile.getOriginalFilename();
        String fileExtension = originalFileName != null && originalFileName.contains(".") 
            ? originalFileName.substring(originalFileName.lastIndexOf("."))
            : ".webm";
        
        String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
        Path filePath = Paths.get(AUDIO_UPLOAD_DIR + uniqueFileName);
        
        Files.copy(audioFile.getInputStream(), filePath);
        
        return uniqueFileName;
    }
} 