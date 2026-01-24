import { getGeminiAI, MODEL_NAME, ERROR_MESSAGES } from './gemini.config.js'
import { functionDeclarations } from './gemini.functions.js'
import { executeFunctionCall } from './gemini.handlers.js'
import { 
  getUserContext, 
  buildConversationHistory, 
  buildSystemPrompt, 
  buildCompletePrompt 
} from './gemini.prompts.js'

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
    
    console.log("[+] Final AI Response: ", finalResponse.text)
    return finalResponse.text
  }

  // ============ Public Methods ============

  /**
   * Genera una respuesta del asistente basada en el mensaje del usuario
   */
  async generateResponse(message, userId = null, conversationHistory = []) {
    try {
      // 1. Construir contextos
      const userContext = await getUserContext(userId)
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
      
      // 5. Verificar y procesar llamadas a funciones
      if (response.functionCalls && response.functionCalls.length > 0) {
        return await this._processFunctionCall(
          response, 
          message, 
          userContext, 
          historyContext, 
          config
        )
      }
      
      // 6. Respuesta directa sin function calling
      console.log("[-] No function call found in the response.")
      console.log("Text:", response.text)
      return response.text
      
    } catch (err) {
      console.error("Error generating response: ", err)
      return ERROR_MESSAGES.technical
    }
  }
}
