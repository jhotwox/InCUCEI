import User from "../../models/user.model.js"
import { CONTACT_RESOURCES } from './gemini.config.js'

// ============ Context Builders ============

/**
 * Obtiene el contexto del usuario
 */
export async function getUserContext(userId) {
  if (!userId) return ""
  
  const user = await User.findById(userId).select("name email")
  return user ? `Usuario: ${user.name} Correo: ${user.email}` : ""
}

/**
 * Construye el historial de conversación formateado (últimos 10 mensajes)
 */
export function buildConversationHistory(conversationHistory) {
  if (!conversationHistory || conversationHistory.length === 0) return ""
  
  // Limitar a últimos 10 mensajes para reducir tokens
  const recent = conversationHistory.slice(-10)
  
  let historyContext = "\n\nHistorial:\n"
  recent.forEach((msg) => {
    const date = new Date(msg.createdAt).toLocaleString("es-MX", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    historyContext += `U: ${msg.message}\nA: ${msg.response}\n[${date}]\n\n`
  })
  
  return historyContext
}

// ============ Prompt Builders ============

/**
 * Construye las instrucciones base según el tipo de respuesta
 */
function getBaseInstructions(forFunctionResponse) {
  if (forFunctionResponse) {
    return "Presenta la info de BD al usuario de forma clara sin perder detalles."
  }

  return "Si necesitas info de materias, usa get_subject_material o get_subject_study_plan. Si el usuario pregunta por ubicaciones o quiere ver algo en el mapa, usa show_location_on_map. No avises que usarás las funciones, solo úsalas."
}

/**
 * Construye las instrucciones de funciones si aplica
 */
function getFunctionInstructions(forFunctionResponse) {
  return forFunctionResponse ? '' : '- Usa funciones para materiales/planes de estudio y ubicaciones en el mapa'
}

/**
 * Construye el prompt del sistema base
 */
export function buildSystemPrompt(userContext, historyContext, forFunctionResponse = false) {
  const baseInstructions = getBaseInstructions(forFunctionResponse)
  const functionInstructions = getFunctionInstructions(forFunctionResponse)

  return `Eres "Asistente InCUCEI", asistente escolar de CUCEI.
Ayudas con campus, trámites e info de contacto.

${baseInstructions}

Tono: amable, conciso, profesional. Siempre en español.
No inventes datos. Usa emojis si es apropiado.
Enlaces en formato markdown.

${userContext}${historyContext}

Contactos:
- Servicio Escolar: ${CONTACT_RESOURCES.serviciosEscolares}
- Coordinación Informática: ${CONTACT_RESOURCES.coordinacionInformatica}
- Tel CUCEI: ${CONTACT_RESOURCES.telefono}
- Web CUCEI: ${CONTACT_RESOURCES.sitioWeb}

${functionInstructions}`
}

/**
 * Construye el prompt completo con el mensaje del usuario
 */
export const buildCompletePrompt = (systemPrompt, userMessage) =>
  `${systemPrompt}\n\nP: ${userMessage}`
