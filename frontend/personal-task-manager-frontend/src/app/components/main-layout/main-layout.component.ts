import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter } from 'rxjs/operators';
import { InstallPromptComponent } from '../install-prompt/install-prompt.component';
import { NotificationsComponent } from '../notifications/notifications.component';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    InstallPromptComponent,
    NotificationsComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  currentPageTitle = 'Tâches';
  currentUser: User | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updatePageTitle(event.url);
      });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  private updatePageTitle(url: string): void {
    switch (url) {
      case '/tasks':
        this.currentPageTitle = 'Tâches';
        break;
      case '/notes':
        this.currentPageTitle = 'Notes';
        break;
      case '/schedule':
        this.currentPageTitle = 'Planning';
        break;
      case '/documents':
        this.currentPageTitle = 'Documents';
        break;
      case '/statistics':
        this.currentPageTitle = 'Statistiques';
        break;
      case '/profile':
        this.currentPageTitle = 'Profil';
        break;
      case '/settings':
        this.currentPageTitle = 'Paramètres';
        break;
      default:
        this.currentPageTitle = 'Task Manager';
    }
  }

  getCurrentPageTitle(): string {
    return this.currentPageTitle;
  }

  getDisplayName(): string {
    if (this.currentUser?.firstName && this.currentUser?.lastName) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    return this.currentUser?.username || 'Utilisateur';
  }

  getProfileImageUrl(): string | null {
    // Lire directement depuis localStorage à chaque appel pour détecter les changements
    if (this.currentUser?.id) {
      try {
        const savedImage = localStorage.getItem(`profile_image_${this.currentUser.id}`);
        return savedImage || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  getInitials(): string {
    if (this.currentUser?.firstName && this.currentUser?.lastName) {
      return `${this.currentUser.firstName[0]}${this.currentUser.lastName[0]}`.toUpperCase();
    }
    return this.currentUser?.username?.[0]?.toUpperCase() || 'U';
  }

  onProfileClick(): void {
    this.router.navigate(['/profile']);
  }

  onSettingsClick(): void {
    this.router.navigate(['/settings']);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
