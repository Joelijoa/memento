import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DocumentsService } from '../../services/documents.service';
import { Document, DocumentType, FileType } from '../../models/document.model';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatMenuModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss'
})
export class DocumentsComponent implements OnInit {
  // Exposer les enums pour le template
  DocumentType = DocumentType;
  FileType = FileType;

  documents: Document[] = [];
  currentFolderId?: string;
  currentFolder?: Document;
  selectedDocument?: Document;
  showPreview = false;
  
  newFolderName = '';
  newFileName = '';
  fileContent = '';
  isEditing = false;
  pdfLoadError = false;
  documentLoadError = false;
  
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private documentsService: DocumentsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
    
    // S'abonner aux changements du service pour mettre à jour automatiquement
    this.documentsService.documents$.subscribe(docs => {
      // Filtrer selon le dossier courant
      const filteredDocs = this.currentFolderId 
        ? docs.filter(doc => doc.parentId === this.currentFolderId)
        : docs.filter(doc => !doc.parentId);
      
      // Mettre à jour seulement si la liste a changé
      if (filteredDocs.length !== this.documents.length || 
          filteredDocs.some((doc, i) => doc.id !== this.documents[i]?.id)) {
        this.documents = filteredDocs;
      }
    });
  }

  loadDocuments(): void {
    console.log('Chargement des documents, currentFolderId:', this.currentFolderId);
    this.documentsService.getDocumentsByParent(this.currentFolderId).subscribe({
      next: (docs) => {
        console.log('Documents chargés:', docs.length, docs);
        this.documents = docs;
        if (this.currentFolderId) {
          this.findCurrentFolder();
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des documents:', error);
        // En cas d'erreur, essayer de charger depuis le subject
        this.documentsService.documents$.subscribe(docs => {
          const filteredDocs = this.currentFolderId 
            ? docs.filter(doc => doc.parentId === this.currentFolderId)
            : docs.filter(doc => !doc.parentId);
          console.log('Documents depuis le subject:', filteredDocs.length, filteredDocs);
          this.documents = filteredDocs;
        });
      }
    });
  }

  findCurrentFolder(): void {
    this.documentsService.documents$.subscribe(docs => {
      this.currentFolder = docs.find(d => d.id === this.currentFolderId);
    });
  }

  navigateToFolder(folder: Document): void {
    this.currentFolderId = folder.id;
    this.selectedDocument = undefined;
    this.showPreview = false;
    this.loadDocuments();
  }

  navigateUp(): void {
    if (this.currentFolder?.parentId) {
      this.currentFolderId = this.currentFolder.parentId;
    } else {
      this.currentFolderId = undefined;
    }
    this.selectedDocument = undefined;
    this.showPreview = false;
    this.loadDocuments();
  }

  createFolder(): void {
    if (!this.newFolderName.trim()) {
      this.snackBar.open('Veuillez entrer un nom de dossier', 'Fermer', { duration: 3000 });
      return;
    }

    const folderName = this.newFolderName.trim();
    this.documentsService.createFolder(folderName, this.currentFolderId).subscribe({
      next: (folder) => {
        this.newFolderName = '';
        this.snackBar.open(`Dossier "${folderName}" créé avec succès`, 'Fermer', { duration: 2000 });
        this.loadDocuments();
      },
      error: (error) => {
        console.error('Erreur lors de la création du dossier:', error);
        this.snackBar.open('Erreur lors de la création du dossier', 'Fermer', { duration: 3000 });
      }
    });
  }

  createFile(): void {
    if (!this.newFileName.trim()) {
      this.snackBar.open('Veuillez entrer un nom de fichier', 'Fermer', { duration: 3000 });
      return;
    }

    const fileName = this.newFileName.trim();
    this.documentsService.createFile(fileName, '', this.currentFolderId).subscribe({
      next: (file) => {
        this.newFileName = '';
        this.snackBar.open(`Fichier "${fileName}" créé avec succès`, 'Fermer', { duration: 2000 });
        this.loadDocuments();
        // Sélectionner et ouvrir le fichier en mode édition après un court délai
        setTimeout(() => {
          this.selectDocument(file);
          this.isEditing = true;
        }, 100);
      },
      error: (error) => {
        console.error('Erreur lors de la création du fichier:', error);
        this.snackBar.open('Erreur lors de la création du fichier', 'Fermer', { duration: 3000 });
      }
    });
  }

  uploadFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.documentsService.uploadFile(file, this.currentFolderId).subscribe({
      next: (uploadedFile) => {
        this.snackBar.open(`Fichier "${file.name}" importé avec succès`, 'Fermer', { duration: 2000 });
        this.loadDocuments();
        if (this.fileInput) {
          this.fileInput.nativeElement.value = '';
        }
      },
      error: (error) => {
        console.error('Erreur lors de l\'upload du fichier:', error);
        this.snackBar.open('Erreur lors de l\'import du fichier', 'Fermer', { duration: 3000 });
      }
    });
  }

  selectDocument(document: Document): void {
    this.selectedDocument = { ...document };
    this.showPreview = true;
    this.isEditing = false;
    this.pdfLoadError = false; // Réinitialiser l'erreur PDF
    this.documentLoadError = false; // Réinitialiser l'erreur document

    if (document.type === DocumentType.FILE && document.fileType === FileType.TEXT) {
      // Toujours recharger le document depuis l'API pour obtenir le contenu complet
      // car les listes peuvent ne pas inclure tout le contenu
      this.documentsService.getDocumentById(document.id).subscribe({
        next: (fullDocument) => {
          if (fullDocument) {
            this.selectedDocument = { ...fullDocument };
            // Utiliser le contenu de la base de données si disponible
            const dbContent = fullDocument.content;
            
            if (dbContent && dbContent.trim().length > 0) {
              // Le contenu est dans la base de données, l'utiliser
              this.fileContent = dbContent;
              this.selectedDocument.content = dbContent;
              console.log('Contenu chargé depuis la base de données, taille:', dbContent.length);
            } else {
              // Le contenu n'est pas dans la DB, essayer de charger depuis le fichier
              console.log('Contenu vide dans la DB, tentative de chargement depuis le fichier');
              if (fullDocument.fileUrl) {
                this.loadTextFileContent(fullDocument);
              } else {
                // Pas de fichier non plus, fichier vide
                this.fileContent = '';
                this.selectedDocument.content = '';
              }
            }
          } else {
            // Fallback sur le document de la liste
            console.log('Document non trouvé, utilisation du document de la liste');
            this.fileContent = document.content || '';
            if (this.selectedDocument) {
              this.selectedDocument.content = document.content || '';
            }
            // Si le contenu est vide mais qu'il y a un fileUrl, essayer de charger depuis le fichier
            if ((!this.fileContent || this.fileContent.trim().length === 0) && document.fileUrl) {
              this.loadTextFileContent(document);
            }
          }
        },
        error: (error) => {
          console.error('Erreur lors du chargement du document:', error);
          // Fallback sur le document de la liste
          this.fileContent = document.content || '';
          if (this.selectedDocument) {
            this.selectedDocument.content = document.content || '';
          }
          // Si le contenu est vide mais qu'il y a un fileUrl, essayer de charger depuis le fichier
          if ((!this.fileContent || this.fileContent.trim().length === 0) && document.fileUrl) {
            this.loadTextFileContent(document);
          }
        }
      });
    } else {
      this.fileContent = '';
    }
  }

  loadTextFileContent(document: Document): void {
    // Charger le contenu d'un fichier texte depuis le serveur
    if (document.fileUrl) {
      // Utiliser l'URL complète si elle commence par http, sinon construire l'URL
      const url = document.fileUrl.startsWith('http') 
        ? document.fileUrl 
        : `http://localhost:8080${document.fileUrl}`;
      
      console.log('Tentative de chargement du fichier depuis:', url);
      
      fetch(url)
        .then(response => {
          console.log('Réponse du serveur:', response.status, response.statusText);
          if (response.ok) {
            // Vérifier le Content-Type pour s'assurer que c'est du texte
            const contentType = response.headers.get('content-type');
            console.log('Content-Type:', contentType);
            
            return response.text();
          }
          throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
        })
        .then(text => {
          console.log('Contenu chargé depuis le fichier, taille:', text.length);
          if (text && text.trim().length > 0) {
            this.fileContent = text;
            if (this.selectedDocument) {
              this.selectedDocument.content = text;
            }
          } else {
            console.warn('Fichier vide ou contenu vide');
            this.fileContent = '';
            if (this.selectedDocument) {
              this.selectedDocument.content = '';
            }
          }
        })
        .catch(error => {
          console.error('Erreur lors du chargement du contenu du fichier:', error);
          // Ne pas afficher le snackbar si c'est juste un fichier vide ou si le contenu est déjà dans la DB
          // Afficher seulement si c'est une vraie erreur réseau
          if (error.message && !error.message.includes('404')) {
            this.snackBar.open('Impossible de charger le contenu du fichier: ' + error.message, 'Fermer', { duration: 3000 });
          } else {
            // Fichier non trouvé ou vide, c'est normal pour certains fichiers
            console.log('Fichier non trouvé ou vide, utilisation du contenu de la DB si disponible');
            this.fileContent = '';
            if (this.selectedDocument) {
              this.selectedDocument.content = '';
            }
          }
        });
    } else {
      console.warn('Pas de fileUrl pour charger le contenu');
      this.fileContent = '';
      if (this.selectedDocument) {
        this.selectedDocument.content = '';
      }
    }
  }

  saveFile(): void {
    if (!this.selectedDocument || !this.isEditing) return;

    this.documentsService.updateDocument(this.selectedDocument.id, {
      content: this.fileContent
    }).subscribe({
      next: (updatedDoc) => {
        // Mettre à jour le document sélectionné avec les données retournées par l'API
        if (updatedDoc) {
          this.selectedDocument = { ...updatedDoc };
          this.selectedDocument.content = updatedDoc.content || this.fileContent;
        } else {
          // Si l'API ne retourne pas le document, mettre à jour manuellement
          if (this.selectedDocument) {
            this.selectedDocument.content = this.fileContent;
          }
        }
        this.isEditing = false;
        this.loadDocuments(); // Recharger la liste pour mettre à jour le subject
      },
      error: (error) => {
        console.error('Erreur lors de la sauvegarde:', error);
        this.snackBar.open('Erreur lors de la sauvegarde du fichier', 'Fermer', { duration: 3000 });
      }
    });
  }

  deleteDocument(document: Document): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${document.name}" ?`)) {
      return;
    }

    this.documentsService.deleteDocument(document.id).subscribe({
      next: () => {
        if (this.selectedDocument?.id === document.id) {
          this.selectedDocument = undefined;
          this.showPreview = false;
        }
        this.loadDocuments();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
      }
    });
  }

  getFileIcon(fileType?: FileType): string {
    switch (fileType) {
      case FileType.TEXT:
        return 'description';
      case FileType.IMAGE:
        return 'image';
      case FileType.PDF:
        return 'picture_as_pdf';
      case FileType.VIDEO:
        return 'video_library';
      case FileType.AUDIO:
        return 'audiotrack';
      case FileType.DOCUMENT:
        return 'description';
      default:
        return 'insert_drive_file';
    }
  }

  isImageFile(document: Document): boolean {
    if (document.fileType === FileType.IMAGE) {
      return true;
    }
    // Vérifier aussi par extension ou mimeType si c'est classé comme OTHER
    if (document.fileType === FileType.OTHER && document.fileUrl) {
      const name = document.name.toLowerCase();
      const mimeType = document.mimeType?.toLowerCase() || '';
      return name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || 
             name.endsWith('.gif') || name.endsWith('.bmp') || name.endsWith('.svg') ||
             name.endsWith('.webp') || mimeType.startsWith('image/');
    }
    return false;
  }

  isDocumentFile(document: Document): boolean {
    if (document.fileType === FileType.DOCUMENT) {
      return true;
    }
    // Vérifier aussi par extension si c'est classé comme OTHER
    if (document.fileType === FileType.OTHER && document.fileUrl) {
      const name = document.name.toLowerCase();
      return name.endsWith('.docx') || name.endsWith('.doc');
    }
    return false;
  }

  getPreviewUrl(document: Document): string {
    if (!document.fileUrl) {
      return '';
    }
    // Si l'URL commence déjà par http, l'utiliser telle quelle
    if (document.fileUrl.startsWith('http')) {
      return document.fileUrl;
    }
    // Sinon, construire l'URL complète avec le serveur backend
    return `http://localhost:8080${document.fileUrl}`;
  }

  getSafePreviewUrl(document: Document): SafeResourceUrl {
    const url = this.getPreviewUrl(document);
    if (!url) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }
    // Pour les PDF, ajouter le paramètre toolbar
    if (document.fileType === FileType.PDF) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url + '#toolbar=1');
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getDownloadUrl(document: Document): string {
    if (!document.fileUrl) {
      return '';
    }
    // Pour le téléchargement, utiliser l'URL complète
    return this.getPreviewUrl(document);
  }

  onPdfLoad(event: Event): void {
    this.pdfLoadError = false;
  }

  onPdfError(event: Event): void {
    console.error('Erreur lors du chargement du PDF dans l\'iframe:', event);
    this.pdfLoadError = true;
  }

  getDocumentViewerUrl(document: Document): SafeResourceUrl {
    // Utiliser Google Docs Viewer pour afficher les fichiers .docx
    const fileUrl = this.getPreviewUrl(document);
    if (!fileUrl) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }
    // Google Docs Viewer nécessite une URL accessible publiquement
    // Pour localhost, on peut utiliser l'URL complète du serveur
    const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(viewerUrl);
  }

  onDocumentLoad(event: Event): void {
    this.documentLoadError = false;
  }

  onDocumentError(event: Event): void {
    console.error('Erreur lors du chargement du document dans l\'iframe:', event);
    this.documentLoadError = true;
  }

  canEdit(document: Document): boolean {
    return document.type === DocumentType.FILE && document.fileType === FileType.TEXT;
  }

  formatFileSize(bytes?: number): string {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

