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

  copyLink(surveyId: number) {
    // Construir la URL completa usando el origen actual
    const url = `${window.location.origin}/view/${surveyId}`;

    navigator.clipboard.writeText(url).then(() => {
      alert('¡Link copiado al portapapeles! 📋\nListo para compartir.');
    }).catch(err => {
      console.error('Error al copiar: ', err);
    });
  }

  deleteSurvey(id: number) {
    // Confirmación antes de eliminar
    if (confirm('¿Estás seguro de eliminar esta encuesta? Se perderán todas las respuestas.')) {
      this.surveyService.deleteSurvey(id).subscribe({
        next: () => {
          // Actualizar la lista localmente filtrando la eliminada
          this.surveys = this.surveys.filter(s => s.id !== id);
        },
        error: (err) => alert('Error al eliminar')
      });
    }
  }

  // Alternar el estado activo/inactivo de la encuesta
  toggleStatus(survey: Survey) {
    const newState = !survey.isActive;
    this.surveyService.updateSurvey(survey.id, { isActive: newState }).subscribe({
      next: (updatedSurvey) => {
        // Actualizar el objeto en la lista local
        survey.isActive = updatedSurvey.isActive;
      },
      error: (err) => {
        console.error(err);
        // Se revierte el cambio visual si falló el back
        survey.isActive = !newState;
      }
    });
  }
}
