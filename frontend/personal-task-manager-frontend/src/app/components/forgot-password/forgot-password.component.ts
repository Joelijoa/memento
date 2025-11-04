import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      const email = this.forgotPasswordForm.get('email')?.value;
      
      this.authService.forgotPassword(email).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Si cet email existe, un code de réinitialisation a été envoyé', 'Fermer', { duration: 5000 });
          // Rediriger vers la page de vérification du code avec l'email
          this.router.navigate(['/code-verification'], { queryParams: { email } });
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Erreur lors de la demande de réinitialisation:', error);
          let errorMessage = 'Erreur lors de l\'envoi du code';
          
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
}

