import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginResponse, User } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Signal para tener el usuario reactivo en toda la app
  currentUser = signal<User | null>(null);

  login(credentials: { email: string; password: string }) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        sessionStorage.setItem('access_token', response.access_token);

        // Guardar el usuario en memoria (Signal) para usarlo en el UI
        this.currentUser.set(response.user);
      })
    );
  }

  logout() {
    // Limpieza al cerrar sesión
    sessionStorage.removeItem('access_token');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return sessionStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
