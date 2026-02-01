import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SurveyService } from '../../../core/services/survey';
import { Survey, Question, QuestionType, CreateQuestionRequest } from '../../../core/models/survey.models';

@Component({
  selector: 'app-survey-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './survey-edit.html',
  styleUrl: './survey-edit.scss'
})
export class SurveyEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly surveyService = inject(SurveyService);
  private readonly fb = inject(FormBuilder);

  surveyId!: number;
  survey?: Survey;
  questions: Question[] = []; // Lista local de preguntas para refrescar rápido

  // Formulario para AGREGAR pregunta
  questionForm: FormGroup = this.fb.group({
    text: ['', [Validators.required, Validators.minLength(3)]],
    type: [QuestionType.TEXT, [Validators.required]],
    required: [true],
    // Campos dinámicos para opciones
    options: this.fb.group({
      // Rating
      min: [1],
      max: [5],
      step: [1],
      maxLabel: ['Excelente'],
      // Text
      placeholder: ['Escribe tu respuesta...'],
      longText: [false],
      // Choice
      choices: this.fb.array([]), // Para Multiple Choice
      // Boolean
      positiveLabel: ['Sí'],
      negativeLabel: ['No']
    })
  });

  // Exponer el Enum al HTML
  questionTypes = Object.values(QuestionType);
  QuestionType = QuestionType;
  isSubmitting = false;

  ngOnInit(): void {
    // Obtener ID de la URL
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.surveyId = +id;
      this.loadSurvey();
    }
  }

  loadSurvey() {
    this.surveyService.getSurveyById(this.surveyId).subscribe({
      next: (data) => {
        this.survey = data;
        // Si el backend devuelve las preguntas dentro de 'data.questions', úsalas:
        this.questions = (data as any).questions || [];
      },
      error: (err) => console.error(err)
    });
  }

  // Helper para manejar el Array de Opciones (Multiple Choice)
  get itemsFormArray() {
    return (this.questionForm.get('options') as FormGroup).get('items') as FormArray;
  }

  get choicesFormArray() {
    return (this.questionForm.get('options') as FormGroup).get('choices') as FormArray;
  }

  addChoice() {
    this.choicesFormArray.push(this.fb.control('', Validators.required));
  }

  removeChoice(index: number) {
    this.choicesFormArray.removeAt(index);
  }

  addOptionItem() {
    this.itemsFormArray.push(this.fb.control('', Validators.required));
  }

  removeOptionItem(index: number) {
    this.itemsFormArray.removeAt(index);
  }

  onSubmitQuestion() {
    if (this.questionForm.invalid) return;
    this.isSubmitting = true;

    const formValue = this.questionForm.value;

    const payload: CreateQuestionRequest = {
      text: formValue.text,
      type: formValue.type,
      required: formValue.required,
      options: {}
    };

    switch (formValue.type) {
      case QuestionType.RATING:
        payload.options = {
          min: formValue.options.min,
          max: formValue.options.max,
          step: formValue.options.step,
          maxLabel: formValue.options.maxLabel
        };
        break;

      case QuestionType.SINGLE_CHOICE:
      case QuestionType.MULTIPLE_CHOICE:
        payload.options = {
          choices: formValue.options.choices
        };
        break;

      case QuestionType.TEXT:
        payload.options = {
          placeholder: formValue.options.placeholder,
          longText: formValue.options.longText
        };
        break;

       case QuestionType.BOOLEAN:
        payload.options = {
          positiveLabel: formValue.options.positiveLabel,
          negativeLabel: formValue.options.negativeLabel
        };
        break;
    }

    this.surveyService.createQuestion(this.surveyId, payload).subscribe({
      next: (newQuestion) => {
        // Agregar a la lista local para verla inmediatamente
        this.questions.push(newQuestion);
        this.resetForm();
        // Resetear el formulario parcialmente
        // this.questionForm.get('text')?.reset();
        // this.itemsFormArray.clear();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        alert('Error al crear: ' + (err.error?.message || 'Revisa la consola'));
      }
    });
  }

  resetForm() {
    this.questionForm.patchValue({
      text: '',
      required: true
      // Mantenemos el tipo para agilizar
    });
    this.choicesFormArray.clear();
  }
}
