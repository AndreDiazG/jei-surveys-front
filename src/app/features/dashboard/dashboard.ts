import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Para el routerLink
import { SurveyService } from '../../core/services/survey';
import { Survey } from '../../core/models/survey.models';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  private readonly surveyService = inject(SurveyService);
  public readonly authService = inject(AuthService); // Para mostrar el nombre del usuario

  surveys: Survey[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadSurveys();
  }

  loadSurveys() {
    this.surveyService.getMySurveys().subscribe({
      next: (data) => {
        this.surveys = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando encuestas', err);
        this.isLoading = false;
      }
    });
  }
}
