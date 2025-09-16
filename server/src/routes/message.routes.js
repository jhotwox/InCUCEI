import { Router } from 'express'
import { authRequired } from '../middlewares/validateToken.js'
import {
  sendMessage,
  getConversation,
  getUserChats,
  markAsRead
} from '../controller/message.controller.js'

const router = Router()

// Send a message
router.post('/messages/send', authRequired, sendMessage)

// Get conversation with a user
router.get('/messages/conversation/:userId', authRequired, getConversation)

// Get user chats
router.get('/messages/chats', authRequired, getUserChats)

// Mark messages as read
router.post('/messages/read/:roomId', authRequired, markAsRead)

export default router