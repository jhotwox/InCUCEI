import { GoogleGenAI } from "@google/genai"

// ============ AI Configuration ============
export const AI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
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
  unknownFunction: (name) => `Función ${name} no implementada`
}
