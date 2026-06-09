import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'chatbot_type_preference'

export const saveChatbotType = async (userId, botType) => {
  try {
    await AsyncStorage.setItem(`${STORAGE_KEY}:${userId}`, botType)
  } catch (err) {
    console.error('[-] Error saving chatbot type:', err)
  }
}

export const loadChatbotType = async (userId) => {
  try {
    const value = await AsyncStorage.getItem(`${STORAGE_KEY}:${userId}`)
    return value || 'gemini' // default to gemini
  } catch (err) {
    console.error('[-] Error loading chatbot type:', err)
    return 'gemini'
  }
}
