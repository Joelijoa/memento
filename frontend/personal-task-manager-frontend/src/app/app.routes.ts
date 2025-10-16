import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { NoteListComponent } from './components/note-list/note-list.component';
import { ScheduleViewComponent } from './components/schedule-view/schedule-view.component';
import { StatisticsDashboardComponent } from './components/statistics-dashboard/statistics-dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: '/tasks', pathMatch: 'full' },
      { path: 'tasks', component: TaskListComponent },
      { path: 'notes', component: NoteListComponent },
      { path: 'schedule', component: ScheduleViewComponent },
      { path: 'statistics', component: StatisticsDashboardComponent }
    ]
  }
];
