import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { filter } from 'rxjs/operators';
import { InstallPromptComponent } from '../install-prompt/install-prompt.component';

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
    InstallPromptComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  currentPageTitle = 'Tâches';

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updatePageTitle(event.url);
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
      case '/statistics':
        this.currentPageTitle = 'Statistiques';
        break;
      default:
        this.currentPageTitle = 'Task Manager';
    }
  }

  getCurrentPageTitle(): string {
    return this.currentPageTitle;
  }
}
