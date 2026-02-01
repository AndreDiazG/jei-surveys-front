import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SurveyService } from '../../../core/services/survey';
import {  SurveyResults, QuestionType } from '../../../core/models/survey.models';
// Importar la directiva de gráficas
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-survey-results',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective], // <--- Importante
  templateUrl: './survey-results.html',
  styleUrl: './survey-results.scss'
})
export class SurveyResultsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private surveyService = inject(SurveyService);

  results = signal<SurveyResults | null>(null);
  isLoading = true;
  QuestionType = QuestionType;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadResults(+id);
    }
  }

  loadResults(id: number) {
    this.surveyService.getSurveyResultsCalculated(id).subscribe({
      next: (data) => {
        this.results.set(data);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  // --- Helpers para Gráficas ---

  // 1. Convertir stats a datos de gráfica de Barras (Para RATING o Escalas)
  getBarChartData(stats: { [key: string]: number } = {}): ChartData<'bar'> {
    return {
      labels: Object.keys(stats),
      datasets: [
        { data: Object.values(stats), label: 'Votos', backgroundColor: '#0d6efd' }
      ]
    };
  }

  // 2. Convertir stats a datos de gráfica de Pastel (Para CHOICE)
  getPieChartData(stats: { [key: string]: number } = {}): ChartData<'pie'> {
    return {
      labels: Object.keys(stats),
      datasets: [
        { data: Object.values(stats) }
      ]
    };
  }

  // Configuración genérica para que se vea bien
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };
}
