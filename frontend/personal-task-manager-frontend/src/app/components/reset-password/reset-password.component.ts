import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  public hide = true;
  public hideConfirm = true;
  isLoading = false;
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Récupérer l'email et le code depuis les query params
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      const resetCode = params['code'] || '';
      
      if (!this.email || !resetCode) {
        this.router.navigate(['/forgot-password']);
        return;
      }
      
      this.resetPasswordForm = this.fb.group({
        email: [this.email, [Validators.required, Validators.email]],
        resetCode: [resetCode, [Validators.required, Validators.pattern(/^\d{6}$/)]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
      }, { validators: this.passwordMatchValidator });
    });
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      this.isLoading = true;
      const { email, resetCode, newPassword } = this.resetPasswordForm.value;
      
      this.authService.resetPassword(email, resetCode, newPassword).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Mot de passe réinitialisé avec succès !', 'Fermer', { duration: 3000 });
          this.router.navigate(['/login']);
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Erreur lors de la réinitialisation:', error);
          let errorMessage = 'Erreur lors de la réinitialisation';
          
          if (error.error && error.error.error) {
            errorMessage = error.error.error;
          } else if (error.status === 0) {
            errorMessage = 'Impossible de contacter le serveur';
          }
          
          this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
        }
      });
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}

