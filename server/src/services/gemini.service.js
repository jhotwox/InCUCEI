import { GoogleGenAI } from "@google/genai"
import User from "../models/user.model.js"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export class GeminiService {
  constructor() {
    this.modelName = "gemini-2.5-flash"
  }

  async generateResponse(message, userId = null, conversationHistory = []) {
    try {
      let userContext = ""
      if (userId) {
        const user = await User.findById(userId).select("name email")
        if (user) {
          userContext = `Usuario: ${user.name} Correo: ${user.email}`
        }
      }

      let historyContext = ""
      if (conversationHistory.length > 0) {
        historyContext = "\n\nHistorial de conversación reciente:\n"
        conversationHistory.forEach((msg, index) => {
          const date = new Date(msg.createdAt).toLocaleString("es-MX")
          historyContext += `${index + 1}. Estudiante: "${msg.message}"\n`
          historyContext += `   Asistente: "${msg.response}"\n  (${date})\n\n`
        })
      }

      const systemPrompt = `
        Eres un asistente escolar para estudiantes de CUCEI. Tu nombre es "Asistente InCUCEI".
        Tu objetivo es responder preguntas sobre el campus, trámites y dar información de contacto.
        Sé amable, conciso y profesional. Responde siempre en español.
        Mantén la coherencia con conversaciones anteriores cuando sea relevante.

        ${userContext}

        ${historyContext}

        ---
        Recursos disponibles:
        - Servicios Escolares: servicios.escolares@cucei.udg.mx
        - Coordinación de Informática: coordinacion.di@cucei.udg.mx
        - Teléfono principal: +52 33 1378-5900

        INSTRUCCIONES IMPORTANTES:
        - Si el usuario pregunta sobre algo mencionado en el historial, haz referencia a conversaciones previas
        - Mantén un tono conversacional y natural
        - Si no sabes algo específico, sugiere contactar directamente a los departamentos
        - Recuerda detalles importantes de conversaciones anteriores
        `

      const prompt = `${systemPrompt}\n\nPregunta actual del estudiante: ${message}`

      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
      })
      console.log("AI Response: ", response)
      return response.text
    } catch (err) {
      console.error("Error generating response: ", err)
      return "Disculpa, estoy teniendo problemas técnicos. Por favor intenta más tarde o contacta directamente a servicios escolares."
    }
  }
}

// async function main() {
//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: "Dime quien es AimeP3",
//   })
//   console.log(response)
//   console.log("Result: ", response.text)
// }

// main().catch((err) => {
//   console.error("Error: ", err)
// })
