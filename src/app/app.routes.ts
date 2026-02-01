import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { DashboardComponent } from './features/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';
import { SurveyCreateComponent } from './features/survey/survey-create/survey-create';
import { SurveyEditComponent } from './features/survey/survey-edit/survey-edit';
import { SurveyAnswerComponent } from './features/public/survey-answer/survey-answer';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard] // Protección de la ruta
  },
  {
    path: 'survey/create',
    component: SurveyCreateComponent,
    canActivate: [authGuard]
  },
  {
    path: 'survey/edit/:id',
    component: SurveyEditComponent,
    canActivate: [authGuard]
  },
  { path: 'view/:id', component: SurveyAnswerComponent },
];
