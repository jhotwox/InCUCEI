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

// Career catalog used by Gemini.
// Keep in sync with server/src/data/subjects.data.js (codes) and fill the `name` fields.
// NOTE: You can also add `aliases` so the assistant can recognize full names like
// "ingenieria robotica" or common abbreviations like "robotica or QFB".
//
// EDIT HERE: Fill/adjust the `name` and `aliases` fields.
export const KNOWN_CAREER_CODES = [
  { code: "INNI", name: "ingenieria informatica", aliases: ["informatica", "informática"] },
  { code: "INFO", name: "ingenieria informatica", aliases: ["informatica", "informática"] },
  { code: "ILOT", name: "ingenieria en logistica y transporte", aliases: ["logistica y transporte"] },
  { code: "LILT", name: "licenciatura en logistica y transporte", aliases: ["logistica y transporte"] },
  { code: "INRO", name: "ingenieria robotica", aliases: ["robotica"] },
  { code: "INCE", name: "ingenieria en comunicaciones y electronica", aliases: ["comunicaciones y electronica"] },
  { code: "INEA", name: "ingenieria en electromovilidad y autotronica", aliases: ["electromovilidad", "autotronica"] },
  { code: "INBI", name: "ingenieria biomedica", aliases: ["biomedica"] },
  { code: "INME", name: "ingenieria mecanica electrica", aliases: ["mecanica"] },
  { code: "INDU", name: "ingenieria industrial", aliases: ["ingenieria industrial", "industrial"] },
  { code: "ITOG", name: "ingenieria en topografia geomatica", aliases: ["ingenieria en topografia geomatica", "topografia", "geomática", "geomatica"] },
  { code: "IGFO", name: "ingenieria fotonica", aliases: ["ingenieria fotonica", "fotonica"] },
  { code: "ICIV", name: "ingenieria civil", aliases: ["ingenieria civil", "civil"] },
  { code: "LQFB", name: "licenciatura en quimico farmaceutico biologo", aliases: ["quimico farmaceutico biologo", "qfb"] },
  { code: "LQUI", name: "licenciatura en quimica", aliases: ["licenciatura en quimica", "quimica"] },
  { code: "LIMA", name: "licenciatura en matematicas", aliases: ["licenciatura en matematicas", "matematicas"] }
]

const KNOWN_CAREER_CODE_SET = new Set(KNOWN_CAREER_CODES.map((c) => c.code))

export const isKnownCareerCode = (code) => {
  if (!code) return false
  return KNOWN_CAREER_CODE_SET.has(String(code).toUpperCase().trim())
}

export const getCareerByCode = (code) => {
  const key = String(code || "").toUpperCase().trim()
  return KNOWN_CAREER_CODES.find((c) => c.code === key) || null
}

export const getKnownCareersSummary = () =>
  KNOWN_CAREER_CODES.map((c) => `${c.code}: ${c.name || "(nombre pendiente)"}`).join(" | ")

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
  careerNotFound: (career) => `No se pudo encontrar la carrera ${career}. Por favor verifica el nombre e intenta de nuevo.`,
  studyPlanError: (subject) => `No se pudo encontrar el plan de estudios para la materia ${subject}`,
  materialError: (subject) => `No se pudo encontrar el material de estudio para la materia ${subject}`,
  unknownFunction: (name) => `Función ${name} no implementada`
}
