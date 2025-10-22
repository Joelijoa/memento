import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StatisticsService } from '../../services/statistics.service';
import { Statistics } from '../../models/statistics.model';

@Component({
  selector: 'app-statistics-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './statistics-dashboard.component.html',
  styleUrl: './statistics-dashboard.component.scss'
})
export class StatisticsDashboardComponent implements OnInit {
  todayStats: Statistics = {
    id: 0,
    date: new Date().toISOString().split('T')[0],
    productiveTimeMinutes: 0,
    tasksCompleted: 0,
    notesCreated: 0,
    tasksByDifficulty: '{}',
    notesByType: '{}'
  };

  difficultyStats: any[] = [];
  noteTypeStats: any[] = [];
  last7Days: any[] = [];

  constructor(private statisticsService: StatisticsService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.statisticsService.getDashboardData().subscribe({
      next: (data) => {
        this.todayStats = data['todayStats'] || this.todayStats;
        this.difficultyStats = this.formatDifficultyStats(data['difficultyStats'] || {});
        this.noteTypeStats = this.formatNoteTypeStats(data['noteTypeStats'] || {});
        this.last7Days = data['last7Days'] || [];
        this.updateCharts();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données du dashboard:', error);
        // Utiliser les données par défaut en cas d'erreur
        this.generateMockData();
      }
    });
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  getEfficiencyScore(): number {
    // Calcul simple d'efficacité basé sur les tâches complétées
    const maxTasks = 10; // Nombre maximum de tâches attendues par jour
    const efficiency = Math.min((this.todayStats.tasksCompleted / maxTasks) * 100, 100);
    return Math.round(efficiency);
  }

  private generateMockData(): void {
    // Données simulées pour la démonstration
    this.difficultyStats = [
      { label: 'Facile', count: 5, percentage: 50, class: 'easy' },
      { label: 'Moyenne', count: 3, percentage: 30, class: 'medium' },
      { label: 'Difficile', count: 2, percentage: 20, class: 'hard' }
    ];

    this.noteTypeStats = [
      { label: 'Texte', count: 8, percentage: 70, class: 'text' },
      { label: 'Vocal', count: 2, percentage: 20, class: 'voice' },
      { label: 'Image', count: 2, percentage: 10, class: 'image' }
    ];

    this.last7Days = [
      { name: 'Lun', tasksCompleted: 3, notesCreated: 2 },
      { name: 'Mar', tasksCompleted: 5, notesCreated: 1 },
      { name: 'Mer', tasksCompleted: 2, notesCreated: 4 },
      { name: 'Jeu', tasksCompleted: 7, notesCreated: 3 },
      { name: 'Ven', tasksCompleted: 4, notesCreated: 2 },
      { name: 'Sam', tasksCompleted: 1, notesCreated: 1 },
      { name: 'Dim', tasksCompleted: 0, notesCreated: 0 }
    ];
  }

  private formatDifficultyStats(difficultyData: any): any[] {
    const total = Object.values(difficultyData).reduce((sum: number, count: any) => sum + count, 0);
    if (total === 0) return [];
    
    return Object.entries(difficultyData).map(([key, count]: [string, any]) => ({
      label: this.getDifficultyLabel(key),
      count: count,
      percentage: Math.round((count / total) * 100),
      class: this.getDifficultyClass(key)
    }));
  }

  private formatNoteTypeStats(noteTypeData: any): any[] {
    const total = Object.values(noteTypeData).reduce((sum: number, count: any) => sum + count, 0);
    if (total === 0) return [];
    
    return Object.entries(noteTypeData).map(([key, count]: [string, any]) => ({
      label: this.getNoteTypeLabel(key),
      count: count,
      percentage: Math.round((count / total) * 100),
      class: this.getNoteTypeClass(key)
    }));
  }

  private getDifficultyLabel(key: string): string {
    const labels: { [key: string]: string } = {
      'EASY': 'Facile',
      'MEDIUM': 'Moyenne',
      'HARD': 'Difficile'
    };
    return labels[key] || key;
  }

  private getDifficultyClass(key: string): string {
    const classes: { [key: string]: string } = {
      'EASY': 'easy',
      'MEDIUM': 'medium',
      'HARD': 'hard'
    };
    return classes[key] || 'medium';
  }

  private getNoteTypeLabel(key: string): string {
    const labels: { [key: string]: string } = {
      'TEXT': 'Texte',
      'VOICE': 'Vocal',
      'IMAGE': 'Image'
    };
    return labels[key] || key;
  }

  private getNoteTypeClass(key: string): string {
    const classes: { [key: string]: string } = {
      'TEXT': 'text',
      'VOICE': 'voice',
      'IMAGE': 'image'
    };
    return classes[key] || 'text';
  }

  private updateCharts(): void {
    // Les graphiques sont automatiquement mis à jour via les données formatées
  }
}
