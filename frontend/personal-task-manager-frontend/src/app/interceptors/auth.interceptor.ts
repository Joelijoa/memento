import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    const user = this.authService.getCurrentUser();
    
    let headers = req.headers;
    
    // Ajouter le token d'authentification
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Ajouter l'ID de l'utilisateur dans le header
    // TODO: Remplacer par extraction depuis le JWT token une fois JWT implémenté
    if (user && user.id) {
      headers = headers.set('X-User-Id', user.id.toString());
    }
    
    const cloned = req.clone({ headers });
    return next.handle(cloned);
  }
}

