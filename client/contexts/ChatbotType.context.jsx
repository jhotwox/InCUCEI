import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './Auth.context'
import { loadChatbotType, saveChatbotType } from '../utils/chatbotStorage'

const ChatbotTypeContext = createContext(null)

export const ChatbotTypeProvider = ({ children }) => {
  const [botType, setBotType] = useState('gemini')
  const { user } = useAuth()

  useEffect(() => {
    if (user?.id) {
      loadChatbotType(user.id).then(type => {
        if (type) setBotType(type)
      })
    }
  }, [user?.id])

  const toggleBotType = async () => {
    const newType = botType === 'gemini' ? 'rasa' : 'gemini'
    setBotType(newType)
    if (user?.id) {
      await saveChatbotType(user.id, newType)
    }
  }

  useEffect(() => {
    console.log(`[ChatbotTypeContext] botType changed to: ${botType}`)
  }, [botType])

  return (
    <ChatbotTypeContext.Provider value={{ botType, setBotType, toggleBotType }}>
      {children}
    </ChatbotTypeContext.Provider>
  )
}

export const useChatbotType = () => {
  const context = useContext(ChatbotTypeContext)
  if (!context) {
    throw new Error('useChatbotType must be used within ChatbotTypeProvider')
  }
  return context
}
