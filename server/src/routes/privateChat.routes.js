import { Router } from 'express'
import { authRequired } from '../middlewares/validateToken.js'
import {
  getOrCreatePrivateConversation,
  getPrivateConversations,
  getPrivateConversationMessages,
  sendPrivateMessage,
  markPrivateConversationAsRead,
} from '../controller/privateChat.controller.js'

const router = Router()

// Obtener o crear conversación privada con otro usuario
router.get('/private-chat/:otherUserId', authRequired, getOrCreatePrivateConversation)

// Obtener todas las conversaciones privadas del usuario
router.get('/private-chats', authRequired, getPrivateConversations)

// Obtener mensajes de una conversación privada
router.get('/private-chat/:conversationId/messages', authRequired, getPrivateConversationMessages)

// Enviar mensaje a conversación privada
router.post('/private-message/send', authRequired, sendPrivateMessage)

// Marcar conversación privada como leída
router.put('/private-chat/:conversationId/read', authRequired, markPrivateConversationAsRead)

export default router
