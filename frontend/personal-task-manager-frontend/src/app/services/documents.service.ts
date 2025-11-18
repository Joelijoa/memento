import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Document, DocumentType, FileType } from '../models/document.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  private apiUrl = 'http://localhost:8080/api/documents';
  private documentsSubject = new BehaviorSubject<Document[]>([]);
  public documents$ = this.documentsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Charger les documents si l'utilisateur est déjà connecté
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.loadDocuments();
    }
    
    // S'abonner aux changements de l'utilisateur pour recharger les documents
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadDocuments();
      } else {
        // Si l'utilisateur se déconnecte, vider la liste
        this.documentsSubject.next([]);
      }
    });
  }

  private loadDocuments(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return;
    }
    
    this.getAllDocuments().subscribe({
      next: (documents) => {
        // Les documents sont déjà mis à jour dans le subject par getAllDocuments
      },
      error: (error) => {
        console.error('Erreur lors du chargement des documents:', error);
        // Ne pas utiliser les données mockées, laisser vide
        this.documentsSubject.next([]);
      }
    });
  }

  getAllDocuments(): Observable<Document[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return of([]);
    }

    console.log('Chargement de tous les documents pour l\'utilisateur:', currentUser.id);
    return this.http.get<Document[]>(`${this.apiUrl}/user/${currentUser.id}`).pipe(
      map(docs => {
        console.log('Documents reçus de l\'API:', docs.length, docs);
        const mappedDocs = docs.map(doc => this.mapDocumentToFrontend(doc));
        console.log('Documents mappés:', mappedDocs.length, mappedDocs);
        // Mettre à jour le subject avec tous les documents chargés depuis l'API
        this.updateDocumentsListFromArray(mappedDocs);
        console.log('Subject mis à jour, documents dans le subject:', this.documentsSubject.value.length);
        return mappedDocs;
      }),
      catchError((error) => {
        console.error('Erreur lors du chargement de tous les documents:', error);
        // Retourner un tableau vide au lieu de mocks
        this.documentsSubject.next([]);
        return of([]);
      })
    );
  }

  private mapDocumentToFrontend(doc: any): Document {
    return {
      ...doc,
      id: doc.id?.toString() || '',
      parentId: doc.parentId?.toString(),
      userId: doc.userId?.toString() || '',
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt)
    };
  }

  getDocumentsByParent(parentId?: string): Observable<Document[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return of([]);
    }

    // D'abord, vérifier si on a des documents dans le subject pour ce parent
    const allDocs = this.documentsSubject.value;
    const filteredDocs = parentId 
      ? allDocs.filter(doc => doc.parentId === parentId)
      : allDocs.filter(doc => !doc.parentId);

    // Si parentId est fourni, vérifier si c'est un ID mock (timestamp)
    // Les IDs mock sont des timestamps (très grands nombres > 1000000000000)
    if (parentId) {
      const parentIdNum = parseInt(parentId, 10);
      const isMockId = !isNaN(parentIdNum) && parentIdNum > 1000000000000; // Timestamp > année 2001
      
      // Vérifier si le parent existe dans les documents chargés
      const parentDoc = allDocs.find(doc => doc.id === parentId);
      
      // Si c'est un ID mock ET que le parent n'existe pas dans les documents chargés, utiliser les données locales
      // Sinon, si le parent existe mais n'a pas d'ID réel (c'est un mock), on peut quand même utiliser les données locales
      if (isMockId && !parentDoc) {
        // Retourner les documents filtrés du subject uniquement si c'est un mock qui n'existe pas en base
        return of(filteredDocs);
      }
      
      // Si le parent existe et a un ID réel (pas un mock), on peut appeler l'API
      // Mais si le parent n'existe pas du tout dans les documents chargés, on essaie quand même l'API
      // car il pourrait être en base mais pas encore chargé dans le subject
    }

    // Appeler l'API pour charger depuis la base de données
    const url = parentId 
      ? `${this.apiUrl}/user/${currentUser.id}/parent/${parentId}`
      : `${this.apiUrl}/user/${currentUser.id}/root`;

    return this.http.get<Document[]>(url).pipe(
      map(docs => {
        const mappedDocs = docs.map(doc => this.mapDocumentToFrontend(doc));
        // Mettre à jour le subject avec les documents chargés depuis l'API
        this.updateDocumentsListFromArray(mappedDocs);
        return mappedDocs;
      }),
      catchError((error) => {
        console.error('Erreur lors du chargement des documents par parent:', error);
        // En cas d'erreur 404 ou autre, utiliser les documents locaux du subject
        return of(filteredDocs);
      })
    );
  }

  createFolder(name: string, parentId?: string): Observable<Document> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    // Créer un objet compatible avec le backend (Long au lieu de string)
    const folderRequest: any = {
      name,
      type: DocumentType.FOLDER,
      userId: currentUser.id
    };
    
    if (parentId) {
      folderRequest.parentId = parseInt(parentId, 10);
    }

    return this.http.post<Document>(this.apiUrl, folderRequest).pipe(
      map(doc => {
        const mappedDoc = this.mapDocumentToFrontend(doc);
        // Mettre à jour le subject avec le document sauvegardé en base
        this.updateDocumentsList(mappedDoc);
        return mappedDoc;
      }),
      catchError((error) => {
        console.error('Erreur lors de la création du dossier:', error);
        // Propager l'erreur au lieu de créer un mock
        throw error;
      })
    );
  }

  createFile(name: string, content: string, parentId?: string): Observable<Document> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    // Créer un objet compatible avec le backend (Long au lieu de string)
    const fileRequest: any = {
      name,
      type: DocumentType.FILE,
      fileType: FileType.TEXT,
      content,
      userId: currentUser.id
    };
    
    if (parentId) {
      fileRequest.parentId = parseInt(parentId, 10);
    }

    return this.http.post<Document>(this.apiUrl, fileRequest).pipe(
      map(doc => {
        const mappedDoc = this.mapDocumentToFrontend(doc);
        // Mettre à jour le subject avec le document sauvegardé en base
        this.updateDocumentsList(mappedDoc);
        return mappedDoc;
      }),
      catchError((error) => {
        console.error('Erreur lors de la création du fichier:', error);
        // Propager l'erreur au lieu de créer un mock
        throw error;
      })
    );
  }

  uploadFile(file: File, parentId?: string): Observable<Document> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', currentUser.id.toString());
    if (parentId) {
      formData.append('parentId', parentId.toString());
    }

    return this.http.post<Document>(`${this.apiUrl}/upload`, formData).pipe(
      map(doc => {
        const mappedDoc = this.mapDocumentToFrontend(doc);
        // Mettre à jour le subject avec le document sauvegardé en base
        this.updateDocumentsList(mappedDoc);
        return mappedDoc;
      }),
      catchError((error) => {
        console.error('Erreur lors de l\'upload du fichier:', error);
        // Propager l'erreur au lieu de créer un mock
        throw error;
      })
    );
  }

  updateDocument(id: string, updates: Partial<Document>): Observable<Document> {
    // Convertir les IDs string en Long pour le backend
    const updateRequest: any = { ...updates };
    if (updateRequest.parentId && typeof updateRequest.parentId === 'string') {
      updateRequest.parentId = parseInt(updateRequest.parentId, 10);
    }
    if (updateRequest.userId && typeof updateRequest.userId === 'string') {
      updateRequest.userId = parseInt(updateRequest.userId, 10);
    }
    
    return this.http.put<Document>(`${this.apiUrl}/${id}`, updateRequest).pipe(
      map(doc => {
        const mappedDoc = this.mapDocumentToFrontend(doc);
        // Mettre à jour le subject même en cas de succès API
        this.updateDocumentsList(mappedDoc);
        return mappedDoc;
      }),
      catchError(() => of())
    );
  }

  getDocumentById(id: string): Observable<Document | undefined> {
    return this.http.get<Document>(`${this.apiUrl}/${id}`).pipe(
      map(doc => this.mapDocumentToFrontend(doc)),
      catchError(() => {
        // En cas d'erreur, chercher dans le subject
        const allDocs = this.documentsSubject.value;
        const doc = allDocs.find(d => d.id === id);
        return doc ? of(doc) : of(undefined);
      })
    );
  }

  deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => {
        // Retirer le document du subject
        const currentDocs = this.documentsSubject.value;
        const updatedDocs = currentDocs.filter(doc => doc.id !== id);
        this.documentsSubject.next(updatedDocs);
        return;
      }),
      catchError(() => of())
    );
  }

  private getFileTypeFromMime(mimeType: string): FileType {
    if (mimeType.startsWith('image/')) return FileType.IMAGE;
    if (mimeType === 'application/pdf') return FileType.PDF;
    if (mimeType.startsWith('video/')) return FileType.VIDEO;
    if (mimeType.startsWith('audio/')) return FileType.AUDIO;
    if (mimeType.startsWith('text/')) return FileType.TEXT;
    return FileType.OTHER;
  }

  private updateDocumentsList(newDoc: Document): void {
    const currentDocs = this.documentsSubject.value;
    // Vérifier si le document existe déjà
    const existingIndex = currentDocs.findIndex(doc => doc.id === newDoc.id);
    if (existingIndex >= 0) {
      // Mettre à jour le document existant
      currentDocs[existingIndex] = newDoc;
    } else {
      // Ajouter le nouveau document
      currentDocs.push(newDoc);
    }
    this.documentsSubject.next([...currentDocs]);
  }

  private updateDocumentsListFromArray(newDocs: Document[]): void {
    const currentDocs = this.documentsSubject.value;
    const updatedDocs = [...currentDocs];
    
    // Pour chaque document reçu, mettre à jour ou ajouter
    newDocs.forEach(newDoc => {
      const existingIndex = updatedDocs.findIndex(doc => doc.id === newDoc.id);
      if (existingIndex >= 0) {
        updatedDocs[existingIndex] = newDoc;
      } else {
        updatedDocs.push(newDoc);
      }
    });
    
    this.documentsSubject.next(updatedDocs);
  }

  refreshDocuments(parentId?: string): void {
    // Recharger tous les documents depuis l'API pour s'assurer qu'on a les dernières données
    this.getAllDocuments().subscribe({
      next: (docs) => {
        // Le subject sera mis à jour par getAllDocuments qui appelle updateDocumentsListFromArray
      },
      error: (error) => {
        console.error('Erreur lors du rafraîchissement:', error);
      }
    });
  }

}

