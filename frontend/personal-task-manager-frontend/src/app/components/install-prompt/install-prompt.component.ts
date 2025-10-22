import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MobileService } from '../../services/mobile.service';

@Component({
  selector: 'app-install-prompt',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './install-prompt.component.html',
  styleUrl: './install-prompt.component.scss'
})
export class InstallPromptComponent implements OnInit, OnDestroy {
  showPrompt = false;
  isInstalled = false;
  isMobile = false;

  constructor(private mobileService: MobileService) {}

  ngOnInit() {
    this.isMobile = this.mobileService.isMobile();
    this.isInstalled = this.mobileService.isAppInstalled();
    
    // Afficher le prompt seulement si on est sur mobile et pas encore installé
    if (this.isMobile && !this.isInstalled) {
      // Attendre un peu avant d'afficher le prompt
      setTimeout(() => {
        this.showPrompt = true;
      }, 3000);
    }
  }

  ngOnDestroy() {
    // Nettoyage si nécessaire
  }

  async installApp() {
    const success = await this.mobileService.installApp();
    if (success) {
      this.showPrompt = false;
    }
  }

  dismissPrompt() {
    this.showPrompt = false;
    // Stocker la préférence pour ne pas réafficher
    localStorage.setItem('pwa-install-dismissed', 'true');
  }
}
