import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService, User } from '../../services/auth.service';
import { ThemeService, ThemeMode, NavigationPosition, SidebarState } from '../../services/theme.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  user: User | null = null;
  loading = false;
  
  // Thème
  darkMode = false;
  navigationPosition: NavigationPosition = 'left';
  sidebarState: SidebarState = 'expanded';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    const preferences = this.themeService.getPreferences();
    
    this.darkMode = preferences.mode === 'dark';
    this.navigationPosition = preferences.navigationPosition;
    this.sidebarState = preferences.sidebarState;
    
    this.settingsForm = this.fb.group({
      username: [this.user?.username || '', [Validators.required, Validators.minLength(3)]],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      firstName: [this.user?.firstName || ''],
      lastName: [this.user?.lastName || '']
    });
  }

  onSubmit(): void {
    if (this.settingsForm.valid) {
      this.loading = true;
      
      const formValue = this.settingsForm.value;
      const updatedUser: User = {
        ...this.user!,
        ...formValue
      };
      
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      
      this.loading = false;
      this.snackBar.open('Profil mis à jour avec succès', 'Fermer', { duration: 3000 });
      
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }

  onDarkModeToggle(): void {
    this.themeService.toggleDarkMode();
    this.darkMode = this.themeService.getPreferences().mode === 'dark';
    this.snackBar.open(
      this.darkMode ? 'Mode nuit activé' : 'Mode jour activé',
      'Fermer',
      { duration: 2000 }
    );
  }

  onNavigationPositionChange(position: NavigationPosition): void {
    this.navigationPosition = position;
    this.themeService.setNavigationPosition(position);
    this.snackBar.open('Disposition de navigation mise à jour', 'Fermer', { duration: 2000 });
  }

  onSidebarStateChange(state: SidebarState): void {
    this.sidebarState = state;
    this.themeService.setSidebarState(state);
    this.snackBar.open(
      state === 'expanded' ? 'Barre latérale étendue' : 'Barre latérale réduite',
      'Fermer',
      { duration: 2000 }
    );
  }

  onCancel(): void {
    this.router.navigate(['/profile']);
  }
}

