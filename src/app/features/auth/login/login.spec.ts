import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  // Variables para nuestros Mocks
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    // 1. Mock del AuthService: Simulamos el método login
    authServiceMock = {
      login: vi.fn()
    };

    // 2. Mock del Router: Simulamos el método navigate
    routerMock = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule], // Importamos el componente (es Standalone)
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Inicia el ciclo de vida (ngOnInit)
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // --- TEST DE FORMULARIO ---

  it('el formulario debe ser inválido al inicio (campos vacíos)', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('el formulario debe ser válido con datos correctos', () => {
    // Seteamos valores válidos
    component.loginForm.controls['email'].setValue('test@example.com');
    component.loginForm.controls['password'].setValue('123456'); // Mínimo 6 caracteres

    expect(component.loginForm.valid).toBeTruthy();
  });

  it('no debe llamar al servicio de auth si el formulario es inválido', () => {
    // Intentamos enviar el formulario vacío
    component.onSubmit();

    // Verificamos que NO se haya llamado a login
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  // --- TEST DE LÓGICA DE NEGOCIO ---

  it('debe llamar a login y redirigir al dashboard si las credenciales son válidas', () => {
    // 1. Arrange (Preparar)
    const mockCredentials = { email: 'user@test.com', password: 'password123' };
    component.loginForm.setValue(mockCredentials);

    // Simulamos que el servicio responde exitosamente (Observable con cualquier cosa)
    authServiceMock.login.mockReturnValue(of({ token: 'fake-jwt-token' }));

    // 2. Act (Ejecutar)
    component.onSubmit();

    // 3. Assert (Verificar)
    // expect(component.isLoading).toBe(true); // Debería haber pasado por true (aunque ya volvió a false)
    expect(authServiceMock.login).toHaveBeenCalledWith(mockCredentials);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);

    // Al finalizar, loading debe volver a false
    expect(component.isLoading).toBe(false);
  });

  it('debe mostrar mensaje de error y NO redirigir si el login falla', () => {
    // 1. Arrange
    const mockCredentials = { email: 'fail@test.com', password: 'password123' };
    component.loginForm.setValue(mockCredentials);

    // Simulamos un error del backend (ej: 401 Unauthorized)
    authServiceMock.login.mockReturnValue(throwError(() => new Error('Credenciales malas')));

    // 2. Act
    component.onSubmit();

    // 3. Assert
    expect(authServiceMock.login).toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled(); // ¡Importante! No debe cambiar de página
    expect(component.errorMessage).toBe('Credenciales inválidas. Intenta de nuevo.');
    expect(component.isLoading).toBe(false);
  });
});
