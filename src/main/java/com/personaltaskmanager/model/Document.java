package com.personaltaskmanager.model;

import com.personaltaskmanager.enums.DocumentType;
import com.personaltaskmanager.enums.FileType;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "documents")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private DocumentType type;

    @Column(name = "file_type")
    @Enumerated(EnumType.STRING)
    private FileType fileType;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(length = 10000)
    private String content;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "file_size")
    private Long size;

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

