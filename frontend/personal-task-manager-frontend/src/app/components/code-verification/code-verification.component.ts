import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-code-verification',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    FormsModule
  ],
  templateUrl: './code-verification.component.html',
  styleUrl: './code-verification.component.scss'
})
export class CodeVerificationComponent implements OnInit {
  email: string = '';
  code: string[] = ['', '', '', '', '', ''];
  isLoading = false;
  @ViewChild('codeInput0') codeInput0!: ElementRef;
  @ViewChild('codeInput1') codeInput1!: ElementRef;
  @ViewChild('codeInput2') codeInput2!: ElementRef;
  @ViewChild('codeInput3') codeInput3!: ElementRef;
  @ViewChild('codeInput4') codeInput4!: ElementRef;
  @ViewChild('codeInput5') codeInput5!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      if (!this.email) {
        this.router.navigate(['/forgot-password']);
      }
    });
    
    // Focus sur le premier input après un court délai
    setTimeout(() => {
      if (this.codeInput0) {
        this.codeInput0.nativeElement.focus();
      }
    }, 100);
  }

  onCodeInput(index: number, event: any): void {
    const value = event.target.value;
    
    // Ne garder que les chiffres
    if (!/^\d*$/.test(value)) {
      this.code[index] = '';
      return;
    }
    
    // Limiter à un seul chiffre
    if (value.length > 1) {
      this.code[index] = value.charAt(value.length - 1);
    } else {
      this.code[index] = value;
    }
    
    // Passer au champ suivant si un chiffre est entré
    if (this.code[index] && index < 5) {
      this.focusNextInput(index);
    }
    
    // Vérifier si tous les champs sont remplis
    if (this.code.every(c => c !== '')) {
      this.verifyCode();
    }
  }

  onKeyDown(index: number, event: KeyboardEvent): void {
    // Si Backspace est pressé et le champ est vide, aller au champ précédent
    if (event.key === 'Backspace' && !this.code[index] && index > 0) {
      this.focusPreviousInput(index);
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    for (let i = 0; i < 6; i++) {
      this.code[i] = digits[i] || '';
    }
    
    // Focus sur le dernier champ rempli ou le premier vide
    const lastFilledIndex = digits.length - 1;
    if (lastFilledIndex < 5) {
      this.focusInput(lastFilledIndex + 1);
    } else {
      this.focusInput(5);
      // Vérifier le code si tous les champs sont remplis
      if (digits.length === 6) {
        setTimeout(() => this.verifyCode(), 100);
      }
    }
  }

  focusNextInput(index: number): void {
    const inputs = [
      this.codeInput1, this.codeInput2, this.codeInput3,
      this.codeInput4, this.codeInput5
    ];
    if (index < 5 && inputs[index]) {
      inputs[index].nativeElement.focus();
    }
  }

  focusPreviousInput(index: number): void {
    const inputs = [
      this.codeInput0, this.codeInput1, this.codeInput2,
      this.codeInput3, this.codeInput4
    ];
    if (index > 0 && inputs[index - 1]) {
      inputs[index - 1].nativeElement.focus();
      this.code[index - 1] = '';
    }
  }

  focusInput(index: number): void {
    const inputs = [
      this.codeInput0, this.codeInput1, this.codeInput2,
      this.codeInput3, this.codeInput4, this.codeInput5
    ];
    if (inputs[index]) {
      inputs[index].nativeElement.focus();
    }
  }

  verifyCode(): void {
    const codeString = this.code.join('');
    if (codeString.length !== 6) {
      return;
    }

    this.isLoading = true;
    
    this.authService.verifyResetCode(this.email, codeString).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.valid) {
          // Code valide, rediriger vers la page de réinitialisation
          this.router.navigate(['/reset-password'], {
            queryParams: { email: this.email, code: codeString }
          });
        } else {
          // Code invalide
          this.snackBar.open(response.error || 'Code invalide ou expiré', 'Fermer', { duration: 5000 });
          // Réinitialiser les champs
          this.code = ['', '', '', '', '', ''];
          if (this.codeInput0) {
            this.codeInput0.nativeElement.focus();
          }
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Erreur lors de la vérification:', error);
        let errorMessage = 'Erreur lors de la vérification du code';
        
        if (error.error && error.error.error) {
          errorMessage = error.error.error;
        } else if (error.status === 0) {
          errorMessage = 'Impossible de contacter le serveur';
        }
        
        this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
        // Réinitialiser les champs
        this.code = ['', '', '', '', '', ''];
        if (this.codeInput0) {
          this.codeInput0.nativeElement.focus();
        }
      }
    });
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}

