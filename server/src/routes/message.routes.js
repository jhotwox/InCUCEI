import { Router } from 'express'
import { authRequired } from '../middlewares/validateToken.js'
import {
  sendMessage,
  sendCommerceMessage,
  getConversation,
  getCommerceConversation,
  getUserChats,
  getCommerceChats,
  markAsRead,
  markCommerceAsRead
} from '../controller/message.controller.js'

const router = Router()

// Send a message
router.post('/messages/send', authRequired, sendMessage)

// Send a message as commerce owner to a user
router.post('/messages/send-commerce', authRequired, sendCommerceMessage)

// Get conversation with a commerce
router.get('/messages/conversation/:commerceId', authRequired, getConversation)

// Get conversation for commerce owner with a specific user
router.get('/messages/commerce-conversation/:commerceId/:userId', authRequired, getCommerceConversation)

// Get user chats
router.get('/messages/user-chats', authRequired, getUserChats)

// Get commerce chats
router.get('/messages/commerce-chats', authRequired, getCommerceChats)

// Mark messages as read
router.put('/messages/read/:commerceId', authRequired, markAsRead)

// Mark messages as read for commerce owner
router.put('/messages/commerce/read/:commerceId/:userId', authRequired, markCommerceAsRead)

export default router