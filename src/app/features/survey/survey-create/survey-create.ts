import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SurveyService } from '../../../core/services/survey';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-survey-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './survey-create.html',
  styleUrl: './survey-create.scss'
})
export class SurveyCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly surveyService = inject(SurveyService);
  private readonly router = inject(Router);

  surveyForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: [''] // Opcional
  });

  isSubmitting = false;

  onSubmit() {
    if (this.surveyForm.invalid) return;

    this.isSubmitting = true;

    this.surveyService.createSurvey(this.surveyForm.value).subscribe({
      next: (newSurvey) => {
        console.log('Encuesta creada:', newSurvey);
        this.isSubmitting = false;
        this.router.navigate(['/survey/edit', newSurvey.id]);
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        alert('Error al crear la encuesta');
      }
    });
  }
}
