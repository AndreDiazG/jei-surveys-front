import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Survey, CreateQuestionRequest, SurveyResponsePayload, SurveyResults, SurveySubmission, QuestionResult, QuestionType } from '../models/survey.models';
import { Observable, forkJoin, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/surveys`;

  // Hace uso del interceptor para agregar el token y con este el backend identifica al usuario
  getMySurveys(): Observable<Survey[]> {
    return this.http.get<Survey[]>(this.apiUrl);
  }

  createSurvey(data: { title: string; description?: string }) {
    return this.http.post<Survey>(this.apiUrl, data);
  }

  getSurveyById(id: number): Observable<Survey> {
    return this.http.get<Survey>(`${this.apiUrl}/${id}`);
  }

  createQuestion(surveyId: number, questionData: CreateQuestionRequest): Observable<any> {
    const url = `${this.apiUrl}/${surveyId}/questions`;
    console.log('Creating question at URL:', url, 'with data:', questionData);
    return this.http.post(url, questionData);
  }

  submitResponse(surveyId: number, payload: SurveyResponsePayload): Observable<any> {
    const url = `${this.apiUrl}/${surveyId}/responses`;
    return this.http.post(url, payload);
  }

  getSurveyResponses(id: number): Observable<SurveySubmission[]> {
    return this.http.get<SurveySubmission[]>(`${this.apiUrl}/${id}/responses`);
  }

  getSurveyResultsCalculated(id: number): Observable<SurveyResults> {
    return forkJoin({
      survey: this.getSurveyById(id),
      responses: this.getSurveyResponses(id)
    }).pipe(
      map(({ survey, responses }) => {
        return this.calculateStats(survey, responses);
      })
    );
  }

  updateSurvey(id: number, data: { title?: string; isActive?: boolean }): Observable<Survey> {
    return this.http.patch<Survey>(`${this.apiUrl}/${id}`, data);
  }

  deleteSurvey(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private calculateStats(survey: Survey, submissions: SurveySubmission[]): SurveyResults {
      // A. Inicializar el esqueleto de resultados basado en las PREGUNTAS
      const results: QuestionResult[] = (survey.questions || []).map(q => ({
        questionId: q.id,
        text: q.text,
        type: q.type,
        stats: {}, // Conteo de los votos: { "Opción A": 5, "Opción B": 2 }
        answers: [] // Almacenamiento de textos abiertos
      }));

      // B. Recorrer cada envío de usuario
      submissions.forEach(sub => {
        sub.answers.forEach(ans => this.processAnswer(ans, results, survey));
      });

      return {
        surveyId: survey.id,
        title: survey.title,
        totalResponses: submissions.length,
        results: results
      };
    }

  // Procesar una respuesta individual
  private processAnswer(ans: any, results: QuestionResult[], survey: Survey): void {
    const qResult = results.find(r => r.questionId === ans.questionId);
    if (!qResult) return;

    if (qResult.type === QuestionType.TEXT) {
      if (ans.value) qResult.answers?.push(String(ans.value));
    } else {
      this.processNonTextAnswer(qResult, ans.value, survey);
    }
  }

  // Procesar respuestas no textuales (Choice, Rating, Boolean, etc)
  private processNonTextAnswer(qResult: QuestionResult, answerValue: any, survey: Survey): void {
    // Normalizar a array por si es selección múltiple
    const values = Array.isArray(answerValue) ? answerValue : [answerValue];

    values.forEach(val => {
      const key = this.mapAnswerValueToKey(qResult, val, survey);
      this.incrementStatCounter(qResult, key);
    });
  }

  // Mapear el valor de la respuesta de booleanos a la etiqueta correcta
  private mapAnswerValueToKey(qResult: QuestionResult, val: any, survey: Survey): string {
    // Para booleanos, usar las etiquetas de la pregunta (Sí/No)
    if (qResult.type === QuestionType.BOOLEAN && typeof val === 'boolean') {
      const questionDef = survey.questions?.find(q => q.id === qResult.questionId);
      return val ? (questionDef?.options?.positiveLabel || 'Sí') : (questionDef?.options?.negativeLabel || 'No');
    }
    return String(val);
  }

  // Incrementar el contador en stats para una clave dada
  private incrementStatCounter(qResult: QuestionResult, key: string): void {
    if (!qResult.stats![key]) {
      qResult.stats![key] = 0;
    }
    qResult.stats![key]++;
  }
}
