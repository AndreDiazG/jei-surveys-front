# JEI Surveys Front

Aplicación frontend para la creación, gestión y análisis de encuestas desarrollada con **Angular 21** y **Bootstrap 5**.

## 📋 Descripción

JEI Surveys Front es una plataforma SaaS que permite a los usuarios:

- **Crear y editar encuestas** con múltiples tipos de preguntas
- **Compartir encuestas públicamente** mediante URLs
- **Recopilar respuestas** de respondentes
- **Visualizar estadísticas y resultados** en tiempo real
- **Gestionar autenticación segura** con JWT

## 🚀 Características Principales

### Tipos de Preguntas
- **Texto abierto** - Respuestas de texto libre
- **Selección única** - Una opción entre varias
- **Selección múltiple** - Varias opciones seleccionables
- **Rating** - Escala numérica (ej: 1-5)
- **Booleano** - Sí/No con etiquetas personalizables

### Funcionalidades
- ✅ Autenticación con JWT y Guards protegidos
- ✅ Dashboard con listado de encuestas del usuario
- ✅ Creación y edición de encuestas
- ✅ Previsualización de encuestas antes de publicar
- ✅ Gestión de preguntas con validaciones
- ✅ Visualización de resultados y estadísticas
- ✅ Generación de gráficos con Chart.js
- ✅ Interfaz responsive con Bootstrap Icons

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Angular | 21.1.0 | Framework principal |
| TypeScript | 5.9.2 | Lenguaje de programación |
| Bootstrap | 5.3.8 | Estilos y componentes UI |
| Chart.js | 4.5.1 | Gráficos de estadísticas |
| ng2-charts | 8.0.0 | Integración Chart.js en Angular |
| RxJS | 7.8.0 | Programación reactiva |

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── app.ts                    # Componente raíz
│   ├── app.routes.ts             # Definición de rutas
│   ├── app.config.ts             # Configuración global
│   │
│   ├── core/                     # Lógica de negocio compartida
│   │   ├── guards/
│   │   │   └── auth-guard.ts     # Protección de rutas autenticadas
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts # Inyección de JWT en peticiones
│   │   ├── models/
│   │   │   ├── survey.models.ts  # Interfaces de encuestas
│   │   │   └── auth.model.ts     # Interfaces de autenticación
│   │   └── services/
│   │       └── survey.ts         # Servicio API de encuestas
│   │
│   ├── features/                 # Módulos funcionales
│   │   ├── auth/
│   │   │   └── login/            # Componente de login
│   │   ├── dashboard/            # Panel de encuestas del usuario
│   │   ├── survey/
│   │   │   ├── survey-create/    # Crear nueva encuesta
│   │   │   ├── survey-edit/      # Editar encuesta existente
│   │   │   └── survey-results/   # Visualizar resultados
│   │   ├── public/
│   │   │   └── survey-answer/    # Responder encuesta pública
│   │   └── statistics/           # Análisis y reportes
│   │
│   ├── shared/                   # Componentes y utilidades compartidas
│   │   ├── components/
│   │   └── ui/
│   │
│   └── app.scss                  # Estilos globales
│
├── styles.scss                   # Estilos principales (Bootstrap)
├── main.ts                       # Punto de entrada
└── environments/
    └── environment.ts            # Variables de entorno
```

## 🔐 Rutas Disponibles

| Ruta | Componente | Protegida | Descripción |
|------|-----------|-----------|-------------|
| `/` | - | ❌ | Redirecciona a login |
| `/auth/login` | LoginComponent | ❌ | Autenticación de usuario |
| `/dashboard` | DashboardComponent | ✅ | Panel de encuestas |
| `/survey/create` | SurveyCreateComponent | ✅ | Crear nueva encuesta |
| `/survey/edit/:id` | SurveyEditComponent | ✅ | Editar encuesta |
| `/survey/results/:id` | SurveyResultsComponent | ✅ | Ver resultados |
| `/view/:id` | SurveyAnswerComponent | ❌ | Responder encuesta |

## 🔧 Configuración e Instalación

### Requisitos Previos
- Node.js ≥ 20.x
- npm ≥ 10.8.2
- Backend API ejecutándose en `http://localhost:3000`

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/AndreDiazG/jei-surveys-front.git
cd jei-surveys-front

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Editar src/environments/environment.ts si es necesario

# 4. Iniciar servidor de desarrollo
npm start

# 5. Abrir navegador
# Acceder a http://localhost:4200
```

## 📜 Scripts Disponibles

```bash
npm start              # Inicia servidor de desarrollo (puerto 4200)
npm run build          # Compila para producción
npm run watch          # Construye en modo watch
ng generate component  # Genera nuevo componente
```

## 🔌 API Integration

La aplicación se conecta con el backend en `http://localhost:3000`.

### Endpoints Utilizados

**Autenticación:**
- `POST /auth/login` - Login de usuario
- `POST /auth/register` - Registro nuevo

**Encuestas:**
- `GET /surveys` - Listar encuestas del usuario autenticado
- `POST /surveys` - Crear nueva encuesta
- `GET /surveys/:id` - Obtener detalles de encuesta
- `PUT /surveys/:id` - Actualizar encuesta
- `DELETE /surveys/:id` - Eliminar encuesta

**Preguntas:**
- `POST /surveys/:id/questions` - Agregar pregunta
- `PUT /surveys/:id/questions/:questionId` - Actualizar pregunta
- `DELETE /surveys/:id/questions/:questionId` - Eliminar pregunta

**Respuestas:**
- `POST /surveys/:id/responses` - Enviar respuesta a encuesta
- `GET /surveys/:id/responses` - Obtener respuestas
- `GET /surveys/:id/results` - Calcular estadísticas

## 🔐 Autenticación y Seguridad

### Flow de Autenticación
1. Usuario inicia sesión con email/contraseña
2. Backend retorna `access_token` (JWT)
3. Token se almacena en `sessionStorage`
4. **AuthInterceptor** inyecta token en cada petición HTTP
5. **AuthGuard** protege rutas privadas
6. Si token no existe, usuario es redirigido a login

### AuthGuard
Valida que el usuario esté autenticado antes de acceder a rutas protegidas.

### AuthInterceptor
Intercepta todas las peticiones HTTP y agrega el header:
```
Authorization: Bearer <access_token>
```

## 📊 Cálculo de Estadísticas

El servicio `SurveyService` implementa `calculateStats()` que:

1. **Agrupa respuestas por pregunta**
2. **Cuenta ocurrencias** de cada opción
3. **Normaliza booleanos** a etiquetas (Sí/No)
4. **Almacena textos abiertos** en array separado
5. **Retorna objeto `SurveyResults`** con estadísticas compiladas

```typescript
SurveyResults {
  surveyId: number,
  title: string,
  totalResponses: number,
  results: QuestionResult[] // { questionId, text, type, stats, answers }
}
```

## 🎨 Estilos y Temas

- **Bootstrap 5** para componentes base
- **Bootstrap Icons** para iconografía
- **SCSS** para estilos personalizados
- Sistema de colores responsivo
- Diseño mobile-first

### Variables SCSS Globales
Definidas en `src/styles.scss`:
- Colores de tema
- Tipografía
- Espaciado

## 🧪 Testing

El proyecto usa **Vitest** para pruebas unitarias.

```bash
npm test                          # Ejecutar todos los tests
```

### Archivos de Test
Todos los archivos `.spec.ts` contienen tests unitarios correspondientes a su componente/servicio.

## 📈 Performance y Optimizaciones

- ✅ Standalone Components (Angular 21)
- ✅ OnPush Change Detection
- ✅ Lazy loading de rutas
- ✅ Tree-shaking automático
- ✅ Optimización de bundle

## 🚀 Despliegue

### Build para Producción
```bash
npm run build
```

Genera archivos optimizados en `dist/` listos para producción.

### Requisitos de Servidor
- Node.js o cualquier servidor HTTP estático
- Variables de entorno configuradas
- Backend API accesible
- HTTPS recomendado

## 🤝 Contribución

1. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
2. Commit cambios: `git commit -am 'Agregar nueva funcionalidad'`
3. Push a rama: `git push origin feature/nueva-funcionalidad`
4. Crear Pull Request
