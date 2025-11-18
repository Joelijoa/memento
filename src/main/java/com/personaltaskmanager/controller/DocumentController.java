package com.personaltaskmanager.controller;

import com.personaltaskmanager.model.Document;
import com.personaltaskmanager.service.DocumentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = {"http://localhost:4200", "http://192.168.1.34:4200"})
public class DocumentController {

    private static final Logger logger = LoggerFactory.getLogger(DocumentController.class);

    @Autowired
    private DocumentService documentService;

    @GetMapping("/user/{userId}")
    public List<Document> getAllDocumentsByUser(@PathVariable Long userId) {
        List<Document> documents = documentService.getAllDocumentsByUserId(userId);
        logger.info("Récupération de {} documents pour l'utilisateur {}", documents.size(), userId);
        return documents;
    }

    @GetMapping("/user/{userId}/root")
    public List<Document> getRootDocuments(@PathVariable Long userId) {
        return documentService.getDocumentsByParent(userId, null);
    }

    @GetMapping("/user/{userId}/parent/{parentId}")
    public List<Document> getDocumentsByParent(@PathVariable Long userId, @PathVariable Long parentId) {
        return documentService.getDocumentsByParent(userId, parentId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable Long id) {
        Document document = documentService.getDocumentById(id);
        return document != null 
            ? ResponseEntity.ok(document) 
            : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Document> createDocument(@RequestBody Document document) {
        try {
            logger.info("Création d'un document: {}, type: {}, userId: {}", 
                document.getName(), document.getType(), document.getUserId());
            Document created = documentService.createDocument(document);
            logger.info("Document créé avec succès, ID: {}", created.getId());
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            logger.error("Erreur lors de la création du document", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<Document> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "parentId", required = false) Long parentId,
            @RequestParam(value = "userId", required = false) Long userId) {
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }
            Document document = documentService.uploadFile(file, userId, parentId);
            return ResponseEntity.ok(document);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Document> updateDocument(@PathVariable Long id, @RequestBody Document document) {
        Document updated = documentService.updateDocument(id, document);
        return updated != null 
            ? ResponseEntity.ok(updated) 
            : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/files/{filename}")
    public ResponseEntity<byte[]> getFile(@PathVariable String filename) {
        try {
            logger.debug("Tentative de récupération du fichier: {}", filename);
            byte[] fileContent = documentService.getFileContent(filename);
            if (fileContent != null) {
                HttpHeaders headers = new HttpHeaders();
                
                // Déterminer le type MIME à partir du nom de fichier
                String contentType = documentService.getContentTypeFromFilename(filename);
                logger.debug("Type MIME détecté: {}", contentType);
                headers.setContentType(MediaType.parseMediaType(contentType));
                
                // Ajouter les headers CORS pour permettre l'affichage dans l'iframe
                headers.add("Access-Control-Allow-Origin", "*");
                headers.add("Access-Control-Allow-Methods", "GET");
                headers.add("Access-Control-Allow-Headers", "*");
                
                // Pour les fichiers à afficher (images, PDF, vidéo, audio), ne pas forcer le téléchargement
                // Pour les autres, forcer le téléchargement
                if (contentType.startsWith("image/") || 
                    contentType.equals("application/pdf") ||
                    contentType.startsWith("video/") ||
                    contentType.startsWith("audio/") ||
                    contentType.startsWith("text/")) {
                    ContentDisposition disposition = ContentDisposition.inline().filename(filename).build();
                    headers.setContentDisposition(disposition);
                } else {
                    headers.setContentDispositionFormData("attachment", filename);
                }
                
                logger.debug("Fichier trouvé, taille: {} bytes", fileContent.length);
                return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);
            }
            logger.warn("Fichier non trouvé: {}", filename);
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            logger.error("Erreur lors de la récupération du fichier: {}", filename, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

