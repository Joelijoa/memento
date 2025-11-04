package com.personaltaskmanager.service;

import com.personaltaskmanager.model.Document;
import com.personaltaskmanager.enums.DocumentType;
import com.personaltaskmanager.enums.FileType;
import com.personaltaskmanager.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public List<Document> getAllDocumentsByUserId(Long userId) {
        return documentRepository.findByUserId(userId);
    }

    public List<Document> getDocumentsByParent(Long userId, Long parentId) {
        if (parentId == null) {
            return documentRepository.findByUserIdAndParentIdIsNull(userId);
        }
        return documentRepository.findByUserIdAndParentId(userId, parentId);
    }

    public Document getDocumentById(Long id) {
        return documentRepository.findById(id).orElse(null);
    }

    public Document getDocumentByIdAndUserId(Long id, Long userId) {
        return documentRepository.findByIdAndUserId(id, userId).orElse(null);
    }

    public Document createDocument(Document document) {
        document.setCreatedAt(LocalDateTime.now());
        document.setUpdatedAt(LocalDateTime.now());
        Document saved = documentRepository.save(document);
        System.out.println("Document sauvegardé en base avec ID: " + saved.getId() + ", userId: " + saved.getUserId());
        return saved;
    }

    public Document updateDocument(Long id, Document documentUpdates) {
        Optional<Document> documentOpt = documentRepository.findById(id);
        if (documentOpt.isPresent()) {
            Document document = documentOpt.get();
            
            if (documentUpdates.getName() != null) {
                document.setName(documentUpdates.getName());
            }
            if (documentUpdates.getContent() != null) {
                document.setContent(documentUpdates.getContent());
            }
            if (documentUpdates.getParentId() != null) {
                document.setParentId(documentUpdates.getParentId());
            }
            
            document.setUpdatedAt(LocalDateTime.now());
            return documentRepository.save(document);
        }
        return null;
    }

    public void deleteDocument(Long id) {
        Document document = documentRepository.findById(id).orElse(null);
        if (document != null) {
            // Supprimer le fichier physique si c'est un fichier uploadé
            if (document.getFilePath() != null) {
                try {
                    Path filePath = Paths.get(document.getFilePath());
                    Files.deleteIfExists(filePath);
                } catch (IOException e) {
                    System.err.println("Erreur lors de la suppression du fichier: " + e.getMessage());
                }
            }
            
            // Supprimer les documents enfants si c'est un dossier
            if (document.getType() == DocumentType.FOLDER) {
                List<Document> children = documentRepository.findByParentId(id);
                for (Document child : children) {
                    deleteDocument(child.getId());
                }
            }
            
            documentRepository.deleteById(id);
        }
    }

    public Document uploadFile(MultipartFile file, Long userId, Long parentId) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier est vide");
        }
        // Créer le répertoire d'upload s'il n'existe pas
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Générer un nom de fichier unique
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID().toString() + extension;
        
        // Sauvegarder le fichier
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Déterminer le type de fichier
        // Utiliser d'abord le MIME type, puis le nom de fichier comme fallback
        FileType fileType = getFileTypeFromMimeType(file.getContentType());
        if (fileType == FileType.OTHER && originalFilename != null) {
            fileType = getFileTypeFromFilename(originalFilename);
        }

        // Créer l'entité Document
        Document document = new Document();
        document.setName(originalFilename != null ? originalFilename : "fichier");
        document.setType(DocumentType.FILE);
        document.setFileType(fileType);
        document.setParentId(parentId);
        document.setUserId(userId);
        document.setFilePath(filePath.toString());
        document.setFileUrl("/api/documents/files/" + uniqueFilename);
        document.setSize(file.getSize());
        document.setMimeType(file.getContentType());
        document.setCreatedAt(LocalDateTime.now());
        document.setUpdatedAt(LocalDateTime.now());

        // Pour les fichiers texte, lire et stocker le contenu dans la base de données
        if (fileType == FileType.TEXT) {
            try {
                String content = new String(Files.readAllBytes(filePath), "UTF-8");
                document.setContent(content);
                System.out.println("Contenu du fichier texte stocké, taille: " + content.length() + " caractères");
            } catch (IOException e) {
                System.err.println("Erreur lors de la lecture du contenu du fichier texte: " + e.getMessage());
            }
        }

        return documentRepository.save(document);
    }

    public byte[] getFileContent(String filename) throws IOException {
        // Le filename peut être soit le nom original, soit un UUID avec extension
        // Chercher le fichier dans le répertoire uploads
        Path uploadPath = Paths.get(uploadDir);
        Path filePath = uploadPath.resolve(filename);
        
        if (Files.exists(filePath)) {
            return Files.readAllBytes(filePath);
        }
        
        // Si le fichier n'est pas trouvé directement, chercher par pattern
        // (par exemple si on cherche par UUID mais que le fichier a été renommé)
        try {
            return Files.list(uploadPath)
                .filter(path -> path.getFileName().toString().equals(filename) || 
                               path.getFileName().toString().startsWith(filename) ||
                               path.getFileName().toString().endsWith(filename))
                .findFirst()
                .map(path -> {
                    try {
                        return Files.readAllBytes(path);
                    } catch (IOException e) {
                        return null;
                    }
                })
                .orElse(null);
        } catch (IOException e) {
            System.err.println("Erreur lors de la recherche du fichier: " + e.getMessage());
            return null;
        }
    }

    private FileType getFileTypeFromMimeType(String mimeType) {
        if (mimeType == null) {
            return FileType.OTHER;
        }
        
        if (mimeType.startsWith("image/")) {
            return FileType.IMAGE;
        } else if (mimeType.equals("application/pdf")) {
            return FileType.PDF;
        } else if (mimeType.startsWith("video/")) {
            return FileType.VIDEO;
        } else if (mimeType.startsWith("audio/")) {
            return FileType.AUDIO;
        } else if (mimeType.startsWith("text/")) {
            return FileType.TEXT;
        }
        return FileType.OTHER;
    }

    private FileType getFileTypeFromFilename(String filename) {
        if (filename == null) {
            return FileType.OTHER;
        }
        
        String lowerFilename = filename.toLowerCase();
        if (lowerFilename.endsWith(".py") || lowerFilename.endsWith(".js") || 
            lowerFilename.endsWith(".ts") || lowerFilename.endsWith(".java") ||
            lowerFilename.endsWith(".html") || lowerFilename.endsWith(".css") ||
            lowerFilename.endsWith(".json") || lowerFilename.endsWith(".xml") ||
            lowerFilename.endsWith(".txt") || lowerFilename.endsWith(".md") ||
            lowerFilename.endsWith(".sql") || lowerFilename.endsWith(".sh") ||
            lowerFilename.endsWith(".bat") || lowerFilename.endsWith(".yml") ||
            lowerFilename.endsWith(".yaml") || lowerFilename.endsWith(".properties")) {
            return FileType.TEXT;
        } else if (lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg") ||
                   lowerFilename.endsWith(".png") || lowerFilename.endsWith(".gif") ||
                   lowerFilename.endsWith(".bmp") || lowerFilename.endsWith(".svg") ||
                   lowerFilename.endsWith(".webp")) {
            return FileType.IMAGE;
        } else if (lowerFilename.endsWith(".pdf")) {
            return FileType.PDF;
        } else if (lowerFilename.endsWith(".mp4") || lowerFilename.endsWith(".avi") ||
                   lowerFilename.endsWith(".mov") || lowerFilename.endsWith(".mkv") ||
                   lowerFilename.endsWith(".webm")) {
            return FileType.VIDEO;
        } else if (lowerFilename.endsWith(".mp3") || lowerFilename.endsWith(".wav") ||
                   lowerFilename.endsWith(".ogg") || lowerFilename.endsWith(".flac")) {
            return FileType.AUDIO;
        }
        return FileType.OTHER;
    }

    public String getContentTypeFromFilename(String filename) {
        if (filename == null) {
            return "application/octet-stream";
        }
        
        String lowerFilename = filename.toLowerCase();
        if (lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (lowerFilename.endsWith(".png")) {
            return "image/png";
        } else if (lowerFilename.endsWith(".gif")) {
            return "image/gif";
        } else if (lowerFilename.endsWith(".pdf")) {
            return "application/pdf";
        } else if (lowerFilename.endsWith(".mp4")) {
            return "video/mp4";
        } else if (lowerFilename.endsWith(".webm")) {
            return "video/webm";
        } else if (lowerFilename.endsWith(".mp3")) {
            return "audio/mpeg";
        } else if (lowerFilename.endsWith(".wav")) {
            return "audio/wav";
        } else if (lowerFilename.endsWith(".py") || lowerFilename.endsWith(".js") || 
                   lowerFilename.endsWith(".ts") || lowerFilename.endsWith(".java") ||
                   lowerFilename.endsWith(".html") || lowerFilename.endsWith(".css") ||
                   lowerFilename.endsWith(".json") || lowerFilename.endsWith(".xml") ||
                   lowerFilename.endsWith(".txt") || lowerFilename.endsWith(".md") ||
                   lowerFilename.endsWith(".sql") || lowerFilename.endsWith(".sh") ||
                   lowerFilename.endsWith(".bat") || lowerFilename.endsWith(".yml") ||
                   lowerFilename.endsWith(".yaml") || lowerFilename.endsWith(".properties")) {
            return "text/plain";
        }
        return "application/octet-stream";
    }
}

