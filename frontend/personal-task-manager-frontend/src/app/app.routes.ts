import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { NoteListComponent } from './components/note-list/note-list.component';
import { ScheduleViewComponent } from './components/schedule-view/schedule-view.component';
import { StatisticsDashboardComponent } from './components/statistics-dashboard/statistics-dashboard.component';
import { DocumentsComponent } from './components/documents/documents.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { CodeVerificationComponent } from './components/code-verification/code-verification.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'code-verification',
    component: CodeVerificationComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    canActivate: [LoginGuard]
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
      { path: 'documents', component: DocumentsComponent },
      { path: 'statistics', component: StatisticsDashboardComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  {
    path: '**',
    redirectTo: '/tasks'
  }
];
