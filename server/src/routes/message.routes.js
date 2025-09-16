import { Router } from 'express'
import { authRequired } from '../middlewares/validateToken.js'
import {
  sendMessage,
  getConversation,
  getUserChats,
  getCommerceChats,
  markAsRead
} from '../controller/message.controller.js'

const router = Router()

// Send a message
router.post('/messages/send', authRequired, sendMessage)

// Get conversation with a commerce
router.get('/messages/conversation/:commerceId', authRequired, getConversation)

// Get user chats
router.get('/messages/user-chats', authRequired, getUserChats)

// Get commerce chats
router.get('/messages/commerce-chats', authRequired, getCommerceChats)

// Mark messages as read
router.put('/messages/read/:commerceId', authRequired, markAsRead)

export default router