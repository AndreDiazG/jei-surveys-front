export enum QuestionType {
  TEXT = 'text',
  RATING = 'rating',
  SINGLE_CHOICE = 'single-choice',
  MULTIPLE_CHOICE = 'multiple-choice',
  BOOLEAN = 'boolean'
}

export interface QuestionOptions {
  // Para RATING
  min?: number;
  max?: number;
  step?: number;
  maxLabel?: string;

  // Para SINGLE/MULTIPLE CHOICE
  choices?: string[];
  allowOther?: boolean;
  minSelection?: number;
  maxSelection?: number;

  // Para TEXT
  placeholder?: string;
  longText?: boolean;
  maxLength?: number;

  // Para BOOLEAN
  positiveLabel?: string;
  negativeLabel?: string;
}

// Interfaz para cuando se crea una pregunta nueva
export interface CreateQuestionRequest {
  text: string;
  type: QuestionType;
  required: boolean;
  options?: QuestionOptions;
}

//Interfaz de lectura de una pregunta existente
export interface Question extends CreateQuestionRequest {
  id: number;
  surveyId: number;
}

export interface Survey {
  id: number;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  questions?: Question[];
}

export interface SurveyResponsePayload {
  answers: {
    questionId: number;
    value: string | number | boolean | string[];
  }[];
}

// Resultado de una pregunta individual
export interface QuestionResult {
  questionId: number;
  text: string;
  type: QuestionType;
  // Para gráficas: Un objeto donde la clave es la opción y el valor es la cantidad
  // Ej: { "Opción A": 10, "Opción B": 5 }
  stats?: { [key: string]: number };
  // Para preguntas de texto: Lista de respuestas
  answers?: string[];
}

// El objeto completo que devuelve el endpoint de resultados
export interface SurveyResults {
  surveyId: number;
  title: string;
  totalResponses: number;
  results: QuestionResult[];
}

export interface SurveySubmission {
  id: number;
  surveyId: number;
  submittedAt: string;
  answers: {
    questionId: number;
    value: string | number | boolean | string[];
  }[];
}
