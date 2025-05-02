package com.personaltaskmanager.repository;

import com.personaltaskmanager.model.Note;
import com.personaltaskmanager.enums.NoteType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByIsPinned(boolean isPinned);
    List<Note> findByType(NoteType type);
} 