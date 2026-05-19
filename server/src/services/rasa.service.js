import axios from "axios"

const RASA_URL = process.env.RASA_URL || "http://localhost:5005"

export class RasaService {
  constructor() {
    console.log(`📡 RasaService initialized with URL: ${RASA_URL}`)
  }
  /**
   * Sends a message to Rasa and returns the responses.
   * @param {string} message - The user message.
   * @param {string} userId - The user ID (used as sender ID).
   * @param {Object} slots - Optional slots to set before processing the message.
   */
  async sendMessage(message, userId, slots = {}) {
    try {
      const senderId = `user_${userId}`

      // 1. Set slots if provided
      if (Object.keys(slots).length > 0) {
        await this.setSlots(senderId, slots)
      }

      // 2. Send the message
      const response = await axios.post(`${RASA_URL}/webhooks/rest/webhook`, {
        sender: senderId,
        message: message,
      })
      console.log(`[DEBUG] Rasa responses: "${response.text}`)
      // console.log(`[DEBUG] Rasa responses: "${response.map(r => r.text).filter(t => t).join(' | ')}"`)

      return response.data
    } catch (error) {
      console.error("[-] RasaService Error:", error.message)
      return [{ text: "Lo siento, tuve un problema al comunicarme con mi motor de lenguaje (Rasa)." }]
    }
  }

  /**
   * Sets slots for a specific conversation.
   * @param {string} senderId - The conversation/sender ID.
   * @param {Object} slots - Key-value pairs of slots to set.
   */
  async setSlots(senderId, slots) {
    try {
      const events = Object.entries(slots).map(([name, value]) => ({
        event: "slot",
        name,
        value,
      }))

      await axios.post(`${RASA_URL}/conversations/${senderId}/tracker/events`, events)
    } catch (error) {
      console.error("[-] RasaService setSlots Error:", error.message)
    }
  }

  /**
   * Gets the current tracker for a conversation.
   * @param {string} senderId 
   */
  async getTracker(senderId) {
    try {
      const response = await axios.get(`${RASA_URL}/conversations/${senderId}/tracker`)
      return response.data
    } catch (error) {
      console.error("[-] RasaService getTracker Error:", error.message)
      return null
    }
  }

  /**
   * Gets all slots from the tracker.
   * @param {string} senderId 
   */
  async getSlots(senderId) {
    const tracker = await this.getTracker(senderId)
    return tracker?.slots || {}
  }
}
