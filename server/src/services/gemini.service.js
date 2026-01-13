// import { GoogleGenAI, Type } from "@google/genai"
// import User from "../models/user.model.js"
// import { getStudyPlan, getSubjectByName } from '../services/subjects.service.js';
// import { formatSubjectName } from "../libs/string.utils.js";

// // ============ Constants ============
// const AI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
// const MODELNAME = "gemini-2.5-flash"

// const CONTACT_RESOURCES = {
//   serviciosEscolares: "servicios.escolares@cucei.udg.mx",
//   coordinacionInformatica: "coordinacion.di@cucei.udg.mx",
//   telefono: "+52 33 1378-5900",
//   sitioWeb: "https://www.cucei.udg.mx/"
// }

// const ERROR_MESSAGES = {
//   technical: "Disculpa, estoy teniendo problemas técnicos. Por favor intenta más tarde o contacta directamente a servicios escolares.",
//   subjectNotFound: (subject) => `No se pudo encontrar la materia ${subject}. Por favor verifica el nombre e intenta de nuevo.`,
//   studyPlanError: (subject) => `No se pudo encontrar el plan de estudios para la materia ${subject}`
// }

// // ============ Function Declarations ============
// const getSubjectMaterialDeclaration = {
//   name: "get_subject_material",
//   description: "Get study material for a given subject in CUCEI",
//   parameters: {
//     type: Type.OBJECT,
//     properties: {
//       subject: {
//         type: Type.STRING,
//         description: "The subject name, e.g. Mathematics, Physics, Chemistry",
//       },
//     },
//     required: ["subject"],
//   },
// }

// const getSubjectStudyPlanDeclaration = {
//   name: "get_subject_study_plan",
//   description: "Get study plan for a given subject in CUCEI",
//   parameters: {
//     type: Type.OBJECT,
//     properties: {
//       subject: {
//         type: Type.STRING,
//         description: "The subject name, e.g. Mathematics, Physics, Chemistry",
//       },
//     },
//     required: ["subject"],
//   },
// }

// // TODO: delete
// const getSubjectsDeclaration = {
//   name: "get_subjects",
//   description: "Get all subjects in CUCEI",
// }

// // ============ GeminiService Class ============
// export class GeminiService {
//   constructor() {
//     this.modelName = MODELNAME
//     this.functionDeclarations = [
//       getSubjectMaterialDeclaration,
//       getSubjectStudyPlanDeclaration,
//       getSubjectsDeclaration
//     ]
//   }

//   // ============ Private Helper Methods ============
  
//   /**
//    * Obtiene el contexto del usuario
//    */
//   async _getUserContext(userId) {
//     if (!userId) return ""
    
//     const user = await User.findById(userId).select("name email")
//     return user ? `Usuario: ${user.name} Correo: ${user.email}` : ""
//   }

//   /**
//    * Construye el historial de conversación formateado
//    */
//   _buildConversationHistory(conversationHistory) {
//     if (!conversationHistory || conversationHistory.length === 0) return ""
    
//     let historyContext = "\n\nHistorial de conversación reciente:\n"
//     conversationHistory.forEach((msg, index) => {
//       const date = new Date(msg.createdAt).toLocaleString("es-MX")
//       historyContext += `${index + 1}. Estudiante: "${msg.message}"\n`
//       historyContext += `   Asistente: "${msg.response}"\n  (${date})\n\n`
//     })
    
//     return historyContext
//   }

//   /**
//    * Construye el prompt del sistema base
//    */
//   _buildBaseSystemPrompt(userContext, historyContext, forFunctionResponse = false) {
//     const baseInstructions = forFunctionResponse 
//       ? "IMPORTANTE: Estas entregando información proveniente de una consulta a una base de datos por lo que debes de tomar la información dada y darsela al usuario de manera fácil y comprensible sin perder información."
//       : `IMPORTANTE: Cuando el usuario solicite material de estudio, plan de estudio, recursos o información sobre una materia específica,
//         DEBES usar la función get_subject_material inmediatamente para obtener material de apoyo.
//         DEBES usar la función get_subject_study_plan para obtener el plan de estudios de una materia específica. 
//         NO describas que vas a usar la función, simplemente úsala. La función te dará la información que necesitas para responder al usuario.`

//     return `
//       Eres un asistente escolar para estudiantes de CUCEI. Tu nombre es "Asistente InCUCEI".
//       Tu objetivo es responder preguntas sobre el campus, trámites y dar información de contacto.
      
//       ${baseInstructions}
      
//       Sé amable, conciso y profesional. Responde siempre en español.
//       Mantén la coherencia con conversaciones anteriores cuando sea relevante.
//       No inventes información; si no sabes algo, sugiere contactar a los departamentos correspondientes.
//       Si crees que es viable agrega emojis en tus respuestas para hacerlas más amigables.

//       ${userContext}

//       ${historyContext}

//       ---
//       Recursos disponibles:
//       - Servicios Escolares: ${CONTACT_RESOURCES.serviciosEscolares}
//       - Coordinación de Informática: ${CONTACT_RESOURCES.coordinacionInformatica}
//       - Teléfono principal: ${CONTACT_RESOURCES.telefono}
//       - Sitio web principal: ${CONTACT_RESOURCES.sitioWeb}

//       INSTRUCCIONES IMPORTANTES:
//       - Si el usuario pregunta sobre algo mencionado en el historial, haz referencia a conversaciones previas
//       - Mantén un tono conversacional y natural
//       - Si no sabes algo específico, sugiere contactar directamente a los departamentos
//       - Recuerda detalles importantes de conversaciones anteriores
//       - Si proporcionas una dirección de correo, teléfono, sitio web, etc. Enviar como hyperlink en formato markdown
//       ${!forFunctionResponse ? `- Cuando necesites información sobre materiales de estudio, Usa la función get_subject_material
//       - Cuando necesites información sobre planes de estudio, Usa la función get_subject_study_plan` : ''}
//     `
//   }

//   /**
//    * Ejecuta la función solicitada por el modelo
//    */
//   async _executeFunctionCall(functionCall) {
//     console.log(`[+] Function to call: ${functionCall.name}`)
//     console.log(`[+] Arguments: ${JSON.stringify(functionCall.args)}`)
    
//     const { name, args } = functionCall
    
//     switch (name) {
//       case "get_subject_material":
//         return this._getSubjectMaterial(args.subject)
      
//       case "get_subject_study_plan":
//         return this._getSubjectStudyPlan(args.subject)
      
//       default:
//         console.warn(`[!] Unknown function: ${name}`)
//         return `Función ${name} no implementada`
//     }
//   }

//   /**
//    * Obtiene material de una materia
//    */
//   _getSubjectMaterial(subject) {
//     const result = `El material de estudio para la materia ${subject} está disponible en la plataforma educativa de CUCEI.`
//     console.log(`[+] Subject Material Info: ${result}`)
//     return result
//   }

//   /**
//    * Obtiene el plan de estudios de una materia
//    */
//   _getSubjectStudyPlan(subject) {
//     try {
//       const formattedSubject = formatSubjectName(subject)
//       const foundSubject = getSubjectByName(formattedSubject)

//       if (!foundSubject) {
//         console.log(`[!] Subject not found: ${subject}`)
//         return ERROR_MESSAGES.subjectNotFound(subject)
//       }

//       console.log(`[+] Found Subject: ${JSON.stringify(foundSubject)}`)
//       const studyPlanResponse = getStudyPlan(foundSubject.key, foundSubject.career)
      
//       const result = JSON.stringify({
//         subject: studyPlanResponse.data.subject,
//         code: studyPlanResponse.data.code,
//         file: studyPlanResponse.data.file,
//         path: studyPlanResponse.data.path
//       })
      
//       console.log(`[+] Study Plan Result: ${result}`)
//       return result
      
//     } catch (error) {
//       console.error("Error fetching study plan: ", error)
//       return ERROR_MESSAGES.studyPlanError(subject)
//     }
//   }

//   /**
//    * Genera contenido con el modelo AI
//    */
//   async _generateAIContent(contents, config) {
//     return await AI.models.generateContent({
//       model: this.modelName,
//       contents,
//       config
//     })
//   }

//   /**
//    * Procesa una llamada a función y obtiene la respuesta final
//    */
//   async _processFunctionCall(initialResponse, message, userContext, historyContext, config) {
//     const functionCall = initialResponse.functionCalls[0]
    
//     // Ejecutar la función
//     const functionResult = await this._executeFunctionCall(functionCall)
    
//     // Preparar la respuesta de la función
//     const functionResponsePart = {
//       name: functionCall.name,
//       response: { result: functionResult }
//     }
    
//     // Construir el prompt para la respuesta final
//     const systemPromptResponse = this._buildBaseSystemPrompt(userContext, historyContext, true)
//     const prompt = `${systemPromptResponse}\n\nPregunta actual del estudiante: ${message}`
    
//     // Construir contenidos con la llamada a función y su resultado
//     const responseContents = [
//       { role: 'user', parts: [{ text: prompt }] },
//       initialResponse.candidates[0].content,
//       { role: 'user', parts: [{ functionResponse: functionResponsePart }] }
//     ]
    
//     // Obtener respuesta final
//     const finalResponse = await this._generateAIContent(responseContents, config)
    
//     console.log("[+] Final AI Response: ", finalResponse.text)
//     return finalResponse.text
//   }

//   // ============ Public Methods ============
  
//   /**
//    * Genera una respuesta del asistente basada en el mensaje del usuario
//    */
//   async generateResponse(message, userId = null, conversationHistory = []) {
//     try {
//       // 1. Construir contextos
//       const userContext = await this._getUserContext(userId)
//       const historyContext = this._buildConversationHistory(conversationHistory)
      
//       // 2. Construir prompt inicial
//       const systemPrompt = this._buildBaseSystemPrompt(userContext, historyContext)
//       const prompt = `${systemPrompt}\n\nPregunta actual del estudiante: ${message}`
      
//       // 3. Configurar el modelo
//       const contents = [{ role: 'user', parts: [{ text: prompt }] }]
//       const config = {
//         tools: [{ functionDeclarations: this.functionDeclarations }]
//       }

//       // 4. Generar respuesta inicial
//       const response = await this._generateAIContent(contents, config)
//       console.log("AI Response: ", response)
      
//       // 5. Verificar y procesar llamadas a funciones
//       if (response.functionCalls && response.functionCalls.length > 0) {
//         return await this._processFunctionCall(
//           response, 
//           message, 
//           userContext, 
//           historyContext, 
//           config
//         )
//       }
      
//       // 6. Respuesta directa sin function calling
//       console.log("[-] No function call found in the response.")
//       console.log("Text:", response.text)
//       return response.text
      
//     } catch (err) {
//       console.error("Error generating response: ", err)
//       return ERROR_MESSAGES.technical
//     }
//   }
// }
