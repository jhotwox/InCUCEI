import { GoogleGenAI } from "@google/genai"

// Alternador de API Keys
const GEMINI_API_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY1
]
let apiKeyIndex = 0

function getNextGeminiAI() {
  // Si está en producción, usar solo la primera llave
  if (process.env.NODE_ENV === 'production') {
    return new GoogleGenAI({ apiKey: GEMINI_API_KEYS[0] })
  }
  // Alterna entre las API keys en desarrollo
  apiKeyIndex = (apiKeyIndex + 1) % GEMINI_API_KEYS.length
  return new GoogleGenAI({ apiKey: GEMINI_API_KEYS[apiKeyIndex] })
}

// ============ AI Configuration ============
// Usar getNextGeminiAI() para obtener una instancia alternando la API key
export const getGeminiAI = getNextGeminiAI
export const MODEL_NAME = "gemini-2.5-flash"

// ============ Contact Resources ============
export const CONTACT_RESOURCES = {
  serviciosEscolares: "servicios.escolares@cucei.udg.mx",
  coordinacionInformatica: "coordinacion.di@cucei.udg.mx",
  telefono: "+52 33 1378-5900",
  sitioWeb: "https://www.cucei.udg.mx/"
}

// ============ Error Messages ============
export const ERROR_MESSAGES = {
  technical: "Disculpa, estoy teniendo problemas técnicos. Por favor intenta más tarde o contacta directamente a servicios escolares.",
  subjectNotFound: (subject) => `No se pudo encontrar la materia ${subject}. Por favor verifica el nombre e intenta de nuevo.`,
  studyPlanError: (subject) => `No se pudo encontrar el plan de estudios para la materia ${subject}`,
  materialError: (subject) => `No se pudo encontrar el material de estudio para la materia ${subject}`,
  unknownFunction: (name) => `Función ${name} no implementada`
}
