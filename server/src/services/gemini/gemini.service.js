import { getGeminiAI, MODEL_NAME, ERROR_MESSAGES, isKnownCareerCode } from './gemini.config.js'
import { functionDeclarations } from './gemini.functions.js'
import { executeFunctionCall } from './gemini.handlers.js'
import { 
  getUserContext, 
  buildConversationHistory, 
  buildSystemPrompt, 
  buildCompletePrompt 
} from './gemini.prompts.js'

const CAREER_CODE_RE = /\b[A-Z]{3,6}\b/g

const extractCareerCodeFromText = (text) => {
  const upper = String(text || "").toUpperCase()
  const matches = upper.match(CAREER_CODE_RE) || []
  for (const token of matches) {
    if (isKnownCareerCode(token)) return token
  }
  return null
}

const inferCareerCode = (message, conversationHistory = []) => {
  const fromMessage = extractCareerCodeFromText(message)
  if (fromMessage) return fromMessage

  // Scan recent user messages from newest to oldest.
  for (let i = (conversationHistory?.length || 0) - 1; i >= 0; i--) {
    const m = conversationHistory[i]
    const fromHistory = extractCareerCodeFromText(m?.message)
    if (fromHistory) return fromHistory
  }
  return null
}

const detectSubjectDocsIntent = (message) => {
  const m = String(message || "")
  const isMaterial = /\b(material(es)?|apuntes|diapositiv\w*|presentaci\w*|gu[ií]a(s)?|manual|pdf|archivo)\b/i.test(m)
  const isPlan = /\b(plan de estudio(s)?|programa\b|temario\b|syllabus\b|contenido\b)\b/i.test(m)

  if (isMaterial && isPlan) return "both"
  if (isMaterial) return "material"
  if (isPlan) return "study_plan"
  return null
}

const buildAskCareerCodeMessage = (intent) => {
  const suffix =
    intent === "material"
      ? "para buscar el material"
      : intent === "study_plan"
        ? "para buscar el plan de estudios"
        : "para buscar el material o el plan de estudios"

  return `¿Me dices el código de tu carrera (por ejemplo: INNI, INEA, LQFB, INFO, ILOT, LILT) ${suffix} de esa materia?\n\nCon que respondas solo el código me basta.`
}

const stripRepetitiveClosing = (text) => {
  let t = String(text || "").trim()
  if (!t) return { text: t, removed: false }

  const patterns = [
    /\s*(?:espero(?: que)?[\s\S]*?te (?:sea|haya sido)[\s\S]*?(?:útil|util|de utilidad)[\s\S]*)$/i,
    /\s*(?:espero haberte ayudado[\s\S]*)$/i,
    /\s*(?:si necesitas(?: algo| ayuda| cualquier cosa| algo más)?[,\s]*no dudes en[\s\S]*)$/i,
    /\s*(?:no dudes en preguntar[\s\S]*)$/i,
    /\s*(?:cualquier cosa\s*,?\s*(?:av[ií]same|dime|me dices)[\s\S]*)$/i,
    /\s*(?:estoy (?:aquí|aqui) para ayudarte[\s\S]*)$/i,
  ]

  const original = t
  for (const re of patterns) {
    if (re.test(t)) t = t.replace(re, "").trim()
  }

  return { text: t, removed: t !== original }
}

const varyClosing = (text) => {
  // Do not touch JSON responses.
  try {
    JSON.parse(String(text || ""))
    return text
  } catch {
    // not json
  }

  const { text: base, removed } = stripRepetitiveClosing(text)
  if (!removed) return text

  if (!base) return base
  if (base.trim().endsWith("?")) return base

  const closings = [
    "¿Te ayudo con otra materia?",
    "Si quieres, dime la materia y tu carrera y lo busco.",
    "¿Quieres material o el plan de estudios?",
    "Si algo no coincide, dime tu carrera y el nombre exacto de la materia.",
    "Cuando quieras, seguimos.",
    "", // No agregar un cierre a veces
  ]
  const pick = closings[Math.floor(Math.random() * closings.length)]
  if (!pick) return base
  return `${base}\n\n${pick}`
}

// ============ GeminiService Class ============
export class GeminiService {
  constructor() {
    this.modelName = MODEL_NAME
    this.functionDeclarations = functionDeclarations
  }

  // ============ Private Methods ============

  /**
   * Genera contenido con el modelo AI
   */
  async _generateAIContent(contents, config) {
    // Alterna la API key en cada consulta
    const AI = getGeminiAI()
    return await AI.models.generateContent({
      model: this.modelName,
      contents,
      config
    })
  }

  /**
   * Procesa una llamada a función y obtiene la respuesta final
   */
  async _processFunctionCall(initialResponse, message, userContext, historyContext, config) {
    const functionCall = initialResponse.functionCalls[0]

    // Ejecutar la función
    const functionResult = await executeFunctionCall(functionCall)

    // Verificar si el resultado tiene una acción especial
    let specialAction = null
    try {
      const parsedResult = JSON.parse(functionResult)
      if (parsedResult.action) {
        specialAction = parsedResult
      }
    } catch (e) {
      // No es JSON o no tiene acción especial
      console.log("[-] Don't have any special action or wrong JSON")
    }

    // Preparar la respuesta de la función
    const functionResponsePart = {
      name: functionCall.name,
      response: { result: functionResult }
    }

    // Construir el prompt para la respuesta final
    const systemPromptResponse = buildSystemPrompt(userContext, historyContext, true)
    const prompt = buildCompletePrompt(systemPromptResponse, message)

    // Construir contenidos con la llamada a función y su resultado
    const responseContents = [
      { role: 'user', parts: [{ text: prompt }] },
      initialResponse.candidates[0].content,
      { role: 'user', parts: [{ functionResponse: functionResponsePart }] }
    ]

    // Obtener respuesta final
    const finalResponse = await this._generateAIContent(responseContents, config)

    const finalText = varyClosing(finalResponse.text)
    console.log("[+] Final AI Response: ", finalText)

    // Si hay acción especial, retornar JSON con texto de Gemini
    if (specialAction) {
      const enrichedAction = {
        ...specialAction,
        generatedMessage: finalText // Guardar respuesta de Gemini
      }
      console.log("[+] Returning special action with Gemini message")
      return JSON.stringify(enrichedAction)
    }

    return finalText
  }

  // ============ Public Methods ============

  /**
   * Genera una respuesta del asistente basada en el mensaje del usuario
   */
  async generateResponse(message, userId = null, conversationHistory = []) {
    try {
      const docsIntent = detectSubjectDocsIntent(message)
      const inferredCareer = inferCareerCode(message, conversationHistory)
      if (docsIntent && !inferredCareer) {
        return {
          text: buildAskCareerCodeMessage(docsIntent),
          inferredCareer: null
        }
      }

      // 1. Construir contextos
      const userContextRaw = await getUserContext(userId)
      const userContext = inferredCareer
        ? `${userContextRaw}\nCarrera (según conversación): ${inferredCareer}`
        : userContextRaw
      const historyContext = buildConversationHistory(conversationHistory)
      
      // 2. Construir prompt inicial
      const systemPrompt = buildSystemPrompt(userContext, historyContext)
      const prompt = buildCompletePrompt(systemPrompt, message)
      
      // 3. Configurar el modelo
      const contents = [{ role: 'user', parts: [{ text: prompt }] }]
      const config = {
        tools: [{ functionDeclarations: this.functionDeclarations }]
      }

      // 4. Generar respuesta inicial
      const response = await this._generateAIContent(contents, config)
      console.log("AI Response: ", response)
      
      let finalText = ""

      // 5. Verificar y procesar llamadas a funciones
      if (response.functionCalls && response.functionCalls.length > 0) {
        finalText = await this._processFunctionCall(
          response, 
          message, 
          userContext, 
          historyContext, 
          config
        )
      } else {
        // 6. Respuesta directa sin function calling
        console.log("[-] No function call found in the response.")
        console.log("Text:", response.text)
        finalText = varyClosing(response.text)
      }

      return {
        text: finalText,
        inferredCareer
      }
      
    } catch (err) {
      console.error("Error generating response: ", err)
      return {
        text: ERROR_MESSAGES.technical,
        inferredCareer: null
      }
    }
  }
}
