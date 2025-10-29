import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { NoteListComponent } from './components/note-list/note-list.component';
import { ScheduleViewComponent } from './components/schedule-view/schedule-view.component';
import { StatisticsDashboardComponent } from './components/statistics-dashboard/statistics-dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: '/tasks', pathMatch: 'full' },
      { path: 'tasks', component: TaskListComponent },
      { path: 'notes', component: NoteListComponent },
      { path: 'schedule', component: ScheduleViewComponent },
      { path: 'statistics', component: StatisticsDashboardComponent }
    ]
  },
  {
    path: '**',
    redirectTo: '/tasks'
  }
];
