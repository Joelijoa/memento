import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileImageUrl: string | null = null;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadProfileImage();
  }

  getDisplayName(): string {
    if (this.user?.firstName && this.user?.lastName) {
      return `${this.user.firstName} ${this.user.lastName}`;
    }
    return this.user?.username || 'Utilisateur';
  }

  getInitials(): string {
    if (this.user?.firstName && this.user?.lastName) {
      return `${this.user.firstName[0]}${this.user.lastName[0]}`.toUpperCase();
    }
    return this.user?.username?.[0]?.toUpperCase() || 'U';
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('La taille de l\'image ne doit pas dépasser 5MB', 'Fermer', { duration: 3000 });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImageUrl = e.target.result;
        this.saveProfileImage(e.target.result);
        this.snackBar.open('Photo de profil mise à jour', 'Fermer', { duration: 2000 });
      };
      reader.readAsDataURL(file);
    }
  }

  removeProfileImage(): void {
    this.profileImageUrl = null;
    localStorage.removeItem(`profile_image_${this.user?.id}`);
    this.snackBar.open('Photo de profil supprimée', 'Fermer', { duration: 2000 });
  }

  private loadProfileImage(): void {
    const savedImage = localStorage.getItem(`profile_image_${this.user?.id}`);
    if (savedImage) {
      this.profileImageUrl = savedImage;
    }
  }

  private saveProfileImage(imageData: string): void {
    localStorage.setItem(`profile_image_${this.user?.id}`, imageData);
  }
}

