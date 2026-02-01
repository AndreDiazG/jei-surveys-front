import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SurveyService } from '../../../core/services/survey';
import { Survey, Question, QuestionType, SurveyResponsePayload } from '../../../core/models/survey.models';

@Component({
  selector: 'app-survey-answer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './survey-answer.html',
  styleUrl: './survey-answer.scss'
})
export class SurveyAnswerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private surveyService = inject(SurveyService);
  private fb = inject(FormBuilder);

  survey = signal<Survey | null>(null);
  answerForm: FormGroup = this.fb.group({});

  isLoading = true;
  isSubmitting = false;
  isSuccess = false;

  // Exponer el Enum para el HTML
  QuestionType = QuestionType;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSurvey(+id);
    }
  }

  loadSurvey(id: number) {
    this.surveyService.getSurveyById(id).subscribe({
      next: (data) => {
        this.survey.set(data);
        this.buildForm(data.questions || []);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        // Pendiente redirigir a una página de 404
      }
    });
  }

  buildForm(questions: Question[]) {
    const group: any = {};

    questions.forEach(q => {
      // Creación de un control por cada pregunta.
      // El nombre del control será el ID de la pregunta (para facilitar el mapeo)
      const validators = q.required ? [Validators.required] : [];

      // Si es MULTIPLE_CHOICE, el valor inicial es un array vacío [], si no, null o string vacío
      const initialValue = q.type === QuestionType.MULTIPLE_CHOICE ? [] : '';

      group[q.id] = new FormControl(initialValue, validators);
    });

    this.answerForm = this.fb.group(group);
  }

  // Helper especial para Checkboxes (Multiple Choice)
  onCheckboxChange(questionId: number, optionValue: string, event: any) {
    const control = this.answerForm.get(questionId.toString());
    if (!control) return;

    const currentValues: string[] = control.value || []; // Asegurar que sea array

    if (event.target.checked) {
      // Agregar valor
      control.setValue([...currentValues, optionValue]);
    } else {
      // Quitar valor
      control.setValue(currentValues.filter(v => v !== optionValue));
    }
  }

  onSubmit() {
    if (this.answerForm.invalid || !this.survey()) return;

    this.isSubmitting = true;
    const formData = this.answerForm.value;
    const surveyId = this.survey()!.id;

    // Transformar el objeto { "101": "Respuesta" } al array que pide el Backend
    const answersPayload = Object.keys(formData).map(key => ({
      questionId: +key, // Convertir la key "101" a número 101
      value: formData[key]
    }))
    .filter(answer => {
        const v = answer.value;

        // Si es nulo o indefinido, no se envía
        if (v === null || v === undefined) return false;

        // Si es un texto vacío, no se envía
        if (typeof v === 'string' && v.trim() === '') return false;

        // Si es un arreglo vacío (Multiple Choice), no se envía
        if (Array.isArray(v) && v.length === 0) return false;

        // Si llega aquí, es porque tiene un valor válido (true, false, número, texto lleno)
        return true;
      });

    const payload: SurveyResponsePayload = {
      answers: answersPayload
    };

    this.surveyService.submitResponse(surveyId, payload).subscribe({
      next: () => {
        this.isSuccess = true;
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error enviando respuestas', err);
        this.isSubmitting = false;
        alert('Hubo un error al enviar tus respuestas.');
      }
    });
  }
}
