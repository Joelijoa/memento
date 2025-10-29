package com.personaltaskmanager.repository;

import com.personaltaskmanager.model.Note;
import com.personaltaskmanager.enums.NoteType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByIsPinned(boolean isPinned);
    List<Note> findByType(NoteType type);
    List<Note> findByUserId(Long userId);
    
    @Query("SELECT n FROM Note n WHERE n.createdAt BETWEEN :startDate AND :endDate")
    List<Note> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                    @Param("endDate") LocalDateTime endDate);
} 