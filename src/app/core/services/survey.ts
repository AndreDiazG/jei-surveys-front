import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Survey, CreateQuestionRequest, SurveyResponsePayload } from '../models/survey.models';
import { Observable } from 'rxjs';

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
    const url = `${environment.apiUrl}/surveys/${surveyId}/responses`;
    return this.http.post(url, payload);
  }
}
