import { GoogleGenAI, Type } from "@google/genai"
import User from "../models/user.model.js"
import { getSubjects, getPlan } from '../controller/file.controller.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const getSubjectMaterialDeclaration = {
  name: "get_subject_material",
  description: "Get study material for a given subject in CUCEI",
  parameters: {
    type: Type.OBJECT,
    properties: {
      subject: {
        type: Type.STRING,
        description: "The subject name, e.g. Mathematics, Physics, Chemistry",
      },
    },
    required: ["subject"],
  },
}

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
        No inventes información; si no sabes algo, sugiere contactar a los departamentos correspondientes.

        ${userContext}

        ${historyContext}

        ---
        Recursos disponibles:
        - Servicios Escolares: servicios.escolares@cucei.udg.mx
        - Coordinación de Informática: coordinacion.di@cucei.udg.mx
        - Teléfono principal: +52 33 1378-5900
        - Sitio web principal: https://www.cucei.udg.mx/

        INSTRUCCIONES IMPORTANTES:
        - Si el usuario pregunta sobre algo mencionado en el historial, haz referencia a conversaciones previas
        - Mantén un tono conversacional y natural
        - Si no sabes algo específico, sugiere contactar directamente a los departamentos
        - Recuerda detalles importantes de conversaciones anteriores
        - Si proporcionas una dirección de correo, teléfono, sitio web, etc. Enviar como hyperlink en formato markdown
        - Permitir que el usuario solicite funciones adicionales como pedir material de apoyo y de estudio a través de la función get_subject_material
        `

      const prompt = `${systemPrompt}\n\nPregunta actual del estudiante: ${message}`

      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        // tools: [{
        //   functionDeclarations: [getSubjectMaterialDeclaration],
        // }],
        config: [{
          functionDeclarations: [getSubjectMaterialDeclaration],
        }],
      })

      console.log("AI Response: ", response)
      
      // Check for function calls in the response
      if (response.functionCalls && response.functionCalls.length > 0) {
        const functionCall = response.functionCalls[0]; // Assuming one function call
        console.log(`Function to call: ${functionCall.name}`);
        console.log(`Arguments: ${JSON.stringify(functionCall.args)}`);
        // In a real app, you would call your actual function here:
        // const result = await scheduleMeeting(functionCall.args);
        if (functionCall.name === "get_subject_material") {
          const subject = functionCall.args.subject;
          // Mocked subject material data for demonstration
          const subjectMaterialInfo = `El material de estudio para la materia ${subject} está disponible en la plataforma educativa de CUCEI.`;
          console.log(`Subject Material Info: ${subjectMaterialInfo}`);
          return subjectMaterialInfo;
        }
      } else {
        console.log("No function call found in the response.");
        console.log(response.text);
      }
      
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
