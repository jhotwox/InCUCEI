import User from "../../models/user.model.js"
import { CONTACT_RESOURCES, getKnownCareersSummary } from './gemini.config.js'

// ============ Context Builders ============

/**
 * Obtiene el contexto del usuario
 */
export async function getUserContext(userId) {
  if (!userId) return ""
  
  const user = await User.findById(userId).select("name email career")
  let context = user ? `Usuario: ${user.name} Correo: ${user.email}` : ""
  if (user?.career) {
    context += ` Carrera: ${user.career}`
  }
  return context
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
    return "Presenta la info de BD al usuario de forma clara sin perder detalles. Si el resultado incluye error=missing_career_code o error=invalid_career_code, pide al usuario el código de su carrera (ej. INNI, INEA, LQFB) y NO adivines."
  }

  return `Si necesitas info de materias, usa search_scholar_topic o get_subject_study_plan.

Regla importante (materias): para traer material o plan de estudios necesitas el CÓDIGO de carrera del usuario (p. ej. INNI, INEA, LQFB, INFO, ILOT, LILT).
- Si el usuario NO ha dado su código de carrera aún, PÍDELO primero.
- Nunca inventes ni adivines la carrera.
- Cuando llames a get_subject_study_plan, incluye el argumento career con el código de carrera.

Regla de ambigüedad (tema vs. materia):
- Si el usuario pide "información sobre X" o "material de X" y "X" es tanto una materia como un tema general (ej. "bases de datos", "cálculo"), prefiere usar 'search_scholar_topic'.
- Solo usa 'get_subject_study_plan' si el usuario pide explícitamente el "plan de estudios", "temario" o "programa" de la materia.

Si el usuario pide material sobre un tema general (no una materia específica del plan de estudios), usa search_scholar_topic para buscar en Google Scholar.
Si el usuario pregunta por ubicaciones o quiere ver algo en el mapa, usa show_location_on_map.
Si el usuario pide teléfonos, correos o datos de contacto de alguna área/persona del CUCEI, usa get_contact_resource.
No avises que usarás las funciones, solo úsalas.`
}

/**
 * Construye las instrucciones de funciones si aplica
 */
function getFunctionInstructions(forFunctionResponse) {
  return forFunctionResponse
    ? ''
    : '- Usa funciones para materiales/planes de estudio, ubicaciones en el mapa y búsqueda de contactos'
}

/**
 * Construye el prompt del sistema base
 */
export function buildSystemPrompt(userContext, historyContext, forFunctionResponse = false) {
  const baseInstructions = getBaseInstructions(forFunctionResponse)
  const functionInstructions = getFunctionInstructions(forFunctionResponse)
  const careersSummary = getKnownCareersSummary()

  const contactCucei = CONTACT_RESOURCES?.cucei || {}
  const redes = CONTACT_RESOURCES?.redes_sociales || CONTACT_RESOURCES?.redes || {}
  const telefonoCucei = contactCucei.telefono || CONTACT_RESOURCES?.telefono || "(no disponible)"
  const direccionCucei = contactCucei.direccion || CONTACT_RESOURCES?.direccion || "(no disponible)"
  const webCucei =
    contactCucei.sitio_web || contactCucei.sitioWeb || CONTACT_RESOURCES?.sitioWeb || "(no disponible)"
  const redesText = (() => {
    if (!redes || typeof redes !== 'object') return "(no disponible)"
    const parts = []
    if (redes.facebook) parts.push(`Facebook: ${redes.facebook}`)
    if (redes.twitter) parts.push(`X/Twitter: ${redes.twitter}`)
    if (redes.instagram) parts.push(`Instagram: ${redes.instagram}`)
    if (redes.youtube) parts.push(`YouTube: ${redes.youtube}`)
    return parts.length ? parts.join(" | ") : "(no disponible)"
  })()

  return `Eres "Asistente InCUCEI", asistente escolar de CUCEI.
Ayudas con campus, trámites e info de contacto.

${baseInstructions}

Tono: amable, conciso, profesional. Siempre en español.
No inventes datos. Usa emojis si es apropiado.
Enlaces en formato markdown.

Evita cerrar SIEMPRE con la misma frase. Si haces un cierre, varíalo o a veces no cierres.

${userContext}${historyContext}

Lista de carreras (código → nombre):
${careersSummary}

Contactos:
- Tel CUCEI: ${telefonoCucei}
- Dirección CUCEI: ${direccionCucei}
- Web CUCEI: ${webCucei}
- Redes: ${redesText}

Para contactos específicos (áreas/personas/coordinaciones), usa get_contact_resource.

${functionInstructions}`
}

/**
 * Construye el prompt completo con el mensaje del usuario
 */
export const buildCompletePrompt = (systemPrompt, userMessage) =>
  `${systemPrompt}\n\nP: ${userMessage}`
