import { TestBed } from '@angular/core/testing';
import { SurveyService } from './survey';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { QuestionType, Survey, SurveySubmission } from '../models/survey.models';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('SurveyService', () => {
  let service: SurveyService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/surveys`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),        // Proveer cliente HTTP real
        provideHttpClientTesting(), // Proveer herramienta de testing para interceptar
        SurveyService
      ]
    });

    service = TestBed.inject(SurveyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verifica que no queden peticiones pendientes sin responder
    httpMock.verify();
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  // --- 1. TEST DE MÉTODOS HTTP BÁSICOS ---

  it('getMySurveys debe hacer un GET a la URL correcta', () => {
    const mockSurveys: Survey[] = [{ id: 1, title: 'Test', isActive: true } as any];

    // 1. Llamada al método
    service.getMySurveys().subscribe((surveys) => {
      expect(surveys.length).toBe(1);
      expect(surveys).toEqual(mockSurveys);
    });

    // 2. Intercepción
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');

    // 3. Respuesta simulada
    req.flush(mockSurveys);
  });

  it('createSurvey debe hacer un POST', () => {
    const payload = { title: 'Nueva Encuesta', description: 'Desc' };
    const mockResponse = { id: 10, ...payload };

    service.createSurvey(payload).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush(mockResponse);
  });

  it('createQuestion debe hacer POST a la URL anidada', () => {
    const surveyId = 5;
    const questionData = { text: '¿?', type: QuestionType.TEXT, required: true };

    service.createQuestion(surveyId, questionData).subscribe();

    // Verificamos la URL construida: /surveys/5/questions
    const req = httpMock.expectOne(`${apiUrl}/${surveyId}/questions`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(questionData);

    req.flush({ id: 1 });
  });

  // --- 2. TEST DE LÓGICA COMPLEJA (CALCULATE STATS) ---

  it('getSurveyResultsCalculated debe combinar encuesta y respuestas y calcular estadísticas', () => {
    const surveyId = 100;

    // A. Mock de la Encuesta (Definición)
    const mockSurvey: Survey = {
      id: surveyId,
      title: 'Encuesta Lógica',
      isActive: true,
      questions: [
        {
          id: 1,
          type: QuestionType.BOOLEAN,
          text: '¿Te gusta Angular?',
          required: true,
          options: { positiveLabel: 'Si', negativeLabel: 'No' } // Etiquetas personalizadas
        },
        {
          id: 2,
          type: QuestionType.TEXT,
          text: 'Comentarios',
          required: false
        },
        {
          id: 3,
          type: QuestionType.SINGLE_CHOICE,
          text: 'Color favorito',
          required: true
        }
      ]
    } as any;

    // B. Mock de las Respuestas (Submissions) de 3 usuarios
    const mockSubmissions: SurveySubmission[] = [
      // Usuario 1: Dice 'Si' (true), comenta 'Genial', elige 'Rojo'
      { id: 1, surveyId, submittedAt: '2026-02-02T15:30:00.000Z', answers: [
          { questionId: 1, value: true },
          { questionId: 2, value: 'Genial' },
          { questionId: 3, value: 'Rojo' }
      ]},
      // Usuario 2: Dice 'No' (false), sin comentario, elige 'Azul'
      { id: 2, surveyId, submittedAt: '2026-02-02T15:30:00.000Z', answers: [
          { questionId: 1, value: false },
          { questionId: 3, value: 'Azul' }
      ]},
      // Usuario 3: Dice 'Si' (true), comenta 'Ok', elige 'Rojo'
      { id: 3, surveyId, submittedAt: '2026-02-02T15:30:00.000Z', answers: [
          { questionId: 1, value: true },
          { questionId: 2, value: 'Ok' },
          { questionId: 3, value: 'Rojo' }
      ]}
    ];

    // C. Ejecución
    service.getSurveyResultsCalculated(surveyId).subscribe((result) => {
      // VALIDACIONES DE LÓGICA DE NEGOCIO

      expect(result.totalResponses).toBe(3);
      expect(result.title).toBe('Encuesta Lógica');

      // Validación Pregunta 1 (Boolean con etiquetas)
      const booleanResult = result.results.find(r => r.questionId === 1);
      expect(booleanResult).toBeDefined();
      // Debe haber mapeado true -> 'Si' y false -> 'No'
      expect(booleanResult?.stats!['Si']).toBe(2); // Usuario 1 y 3
      expect(booleanResult?.stats!['No']).toBe(1); // Usuario 2

      // Validación Pregunta 2 (Texto)
      const textResult = result.results.find(r => r.questionId === 2);
      expect(textResult?.answers?.length).toBe(2); // Solo 2 comentarios (uno nulo)
      expect(textResult?.answers).toContain('Genial');
      expect(textResult?.answers).toContain('Ok');

      // Validación Pregunta 3 (Conteo normal)
      const choiceResult = result.results.find(r => r.questionId === 3);
      expect(choiceResult?.stats!['Rojo']).toBe(2);
      expect(choiceResult?.stats!['Azul']).toBe(1);
    });

    // D. Intercepción de ForkJoin
    // Como getSurveyResultsCalculated hace DOS peticiones simultáneas,
    // debemos esperar y responder a AMBAS.

    const reqSurvey = httpMock.expectOne(`${apiUrl}/${surveyId}`);
    expect(reqSurvey.request.method).toBe('GET');
    reqSurvey.flush(mockSurvey); // Devolvemos la encuesta

    const reqResponses = httpMock.expectOne(`${apiUrl}/${surveyId}/responses`);
    expect(reqResponses.request.method).toBe('GET');
    reqResponses.flush(mockSubmissions); // Devolvemos las respuestas
  });

  // --- 3. TEST DE EDGE CASES ---

  it('debe manejar respuestas múltiples (array) correctamente', () => {
    // Simular una pregunta de selección múltiple (Checkbox)
    const mockSurvey = {
      id: 1,
      questions: [{ id: 10, type: QuestionType.MULTIPLE_CHOICE, text: 'Frutas' }]
    } as any;

    const mockSubmissions = [
      {
        answers: [
          // Usuario seleccionó dos opciones: Manzana y Pera
          { questionId: 10, value: ['Manzana', 'Pera'] }
        ]
      }
    ] as any;

    service.getSurveyResultsCalculated(1).subscribe(result => {
      const qResult = result.results[0];
      // Debería haber incrementado ambos contadores
      expect(qResult.stats!['Manzana']).toBe(1);
      expect(qResult.stats!['Pera']).toBe(1);
    });

    httpMock.expectOne(`${apiUrl}/1`).flush(mockSurvey);
    httpMock.expectOne(`${apiUrl}/1/responses`).flush(mockSubmissions);
  });
});
