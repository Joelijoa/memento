package com.personaltaskmanager.model;

import com.personaltaskmanager.enums.NoteType;
import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notes")
public class Note {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 5000)
    private String content;

    @Column(name = "is_pinned")
    @JsonProperty("isPinned")
    private boolean isPinned = false;

    @Column(name = "note_type")
    @Enumerated(EnumType.STRING)
    private NoteType type = NoteType.TEXT;

    @Column(name = "media_path")
    private String mediaPath;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "user_id")
    private Long userId;
}
