import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeMode = 'light' | 'dark';
export type NavigationPosition = 'left' | 'right' | 'top';
export type SidebarState = 'expanded' | 'collapsed';

export interface ThemePreferences {
  mode: ThemeMode;
  navigationPosition: NavigationPosition;
  sidebarState: SidebarState;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme_preferences';
  private readonly DEFAULT_PREFERENCES: ThemePreferences = {
    mode: 'light',
    navigationPosition: 'left',
    sidebarState: 'expanded'
  };

  private preferencesSubject = new BehaviorSubject<ThemePreferences>(this.loadPreferences());
  public preferences$ = this.preferencesSubject.asObservable();

  constructor() {
    this.applyTheme();
  }

  getPreferences(): ThemePreferences {
    return this.preferencesSubject.value;
  }

  setMode(mode: ThemeMode): void {
    const preferences = { ...this.preferencesSubject.value, mode };
    this.updatePreferences(preferences);
    this.applyTheme();
  }

  setNavigationPosition(position: NavigationPosition): void {
    const preferences = { ...this.preferencesSubject.value, navigationPosition: position };
    this.updatePreferences(preferences);
    this.applyTheme();
  }

  setSidebarState(state: SidebarState): void {
    const preferences = { ...this.preferencesSubject.value, sidebarState: state };
    this.updatePreferences(preferences);
    this.applyTheme();
  }

  toggleDarkMode(): void {
    const currentMode = this.preferencesSubject.value.mode;
    this.setMode(currentMode === 'dark' ? 'light' : 'dark');
  }

  private updatePreferences(preferences: ThemePreferences): void {
    this.preferencesSubject.next(preferences);
    localStorage.setItem(this.THEME_KEY, JSON.stringify(preferences));
  }

  private loadPreferences(): ThemePreferences {
    const stored = localStorage.getItem(this.THEME_KEY);
    if (stored) {
      try {
        return { ...this.DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      } catch {
        return this.DEFAULT_PREFERENCES;
      }
    }
    return this.DEFAULT_PREFERENCES;
  }

  private applyTheme(): void {
    const preferences = this.preferencesSubject.value;
    const htmlElement = document.documentElement;
    
    // Appliquer le mode sombre
    if (preferences.mode === 'dark') {
      htmlElement.classList.add('dark-mode');
      htmlElement.setAttribute('data-theme', 'dark');
    } else {
      htmlElement.classList.remove('dark-mode');
      htmlElement.setAttribute('data-theme', 'light');
    }

    // Appliquer la position de navigation
    htmlElement.setAttribute('data-nav-position', preferences.navigationPosition);
    
    // Appliquer l'état de la sidebar
    htmlElement.setAttribute('data-sidebar-state', preferences.sidebarState);
  }
}

