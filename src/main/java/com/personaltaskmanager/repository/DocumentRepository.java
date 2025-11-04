package com.personaltaskmanager.repository;

import com.personaltaskmanager.model.Document;
import com.personaltaskmanager.enums.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByUserId(Long userId);
    List<Document> findByUserIdAndParentId(Long userId, Long parentId);
    List<Document> findByUserIdAndParentIdIsNull(Long userId);
    List<Document> findByParentId(Long parentId);
    List<Document> findByUserIdAndType(Long userId, DocumentType type);
    Optional<Document> findByIdAndUserId(Long id, Long userId);
}

