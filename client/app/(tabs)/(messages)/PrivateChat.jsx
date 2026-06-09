import { useState, useEffect, useCallback, useRef } from "react"
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from "react-native"
import { useLocalSearchParams, useNavigation, useFocusEffect } from "expo-router"
import { Text, ActivityIndicator, useTheme, Appbar, Avatar, Surface } from "react-native-paper"
import { usePrivateChat } from "../../../hooks/usePrivateChat"
import { useSocket } from "../../../contexts/Socket.context"
import { useAuth } from "../../../contexts/Auth.context"
import { useToast } from "../../../contexts/Toast.context"
import { ChatMessage, ChatInput, TypingIndicator, Background } from "../../../components"

/**
 * PrivateChatScreen - Pantalla para conversaciones usuario-usuario
 * 
 * Características:
 * - Cargar historial de mensajes de una conversación privada
 * - Enviar nuevos mensajes en tiempo real
 * - Marcar mensajes como leídos automáticamente
 * - Scroll automático al último mensaje
 * - Header con info del otro usuario
 */
export default function PrivateChatScreen() {
  const theme = useTheme()
  const { otherUserId, otherUserName } = useLocalSearchParams()
  const navigation = useNavigation()
  const { showToast } = useToast()
  const { socket } = useSocket()
  const { user } = useAuth()
  const flatListRef = useRef(null)

  // Hooks
  const {
    messages,
    loading,
    error,
    currentConversation,
    getOrCreatePrivateChat,
    loadPrivateConversationMessages,
    sendPrivateMessage,
    markAsRead,
  } = usePrivateChat()

  // Estado local
  const [messageText, setMessageText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [conversationLoaded, setConversationLoaded] = useState(false)

  // Obtener o crear conversación y cargar mensajes
  useFocusEffect(
    useCallback(() => {
      let isMounted = true

      const initializeChat = async () => {
        if (otherUserId) {
          const conversation = await getOrCreatePrivateChat(otherUserId)
          if (conversation && isMounted) {
            setConversationLoaded(true)
            await loadPrivateConversationMessages(conversation._id)
            // Marcar como leído
            setTimeout(() => {
              if (isMounted) {
                markAsRead(conversation._id)
              }
            }, 500)

            // Unirse al room de Socket.IO
            if (socket) {
              socket.emit("joinRoom", conversation.roomId)
            }
          }
        }
      }

      if (!conversationLoaded) {
        initializeChat()
      }

      return () => {
        isMounted = false
      }
    }, [otherUserId, conversationLoaded, getOrCreatePrivateChat, loadPrivateConversationMessages, markAsRead, socket])
  )

  // Escuchar eventos de Socket.IO
  useEffect(() => {
    if (!socket) return

    const handleUserTyping = (data) => {
      if (data?.senderId !== otherUserId) return
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 3000)
    }

    socket.on("userTyping", handleUserTyping)

    return () => {
      socket.off("userTyping", handleUserTyping)
    }
  }, [socket, otherUserId])

  // Manejar errores
  useEffect(() => {
    if (error) {
      showToast("Error en la conversación", "error")
      console.error("Error chat: ", error)
    }
  }, [error])

  // Scroll automático al último mensaje
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages])

  // Enviar mensaje
  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentConversation) return

    const content = messageText
    setMessageText("")

    try {
      setIsSending(true)
      await sendPrivateMessage(currentConversation._id, content)
    } catch (err) {
      setMessageText(content)
      console.error("Error sending message: ", err)
      showToast("Error al enviar mensaje", "error")
    } finally {
      setIsSending(false)
    }
  }

  const renderMessageItem = ({ item, index }) => {
    // Determinar si el mensaje es del usuario actual
    const isOwnMessage = user?.id && (item.sender?._id === user.id || item.sender === user.id)
    
    return (
      <ChatMessage
        text={item.content}
        isUser={isOwnMessage}
        timestamp={item.createdAt}
        isRead={item.isRead}
        senderName={item.sender?.name || "Usuario"}
        avatarUrl={item.sender?.profileUrl}
        index={index}
      />
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Background />

      {/* Header */}
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title={otherUserName || "Conversación"}
          subtitle="Leyendo..."
        />
      </Appbar.Header>

      {/* Chat Messages */}
      {loading && !messages.length ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item._id?.toString()}
            contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 8 }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text>No hay mensajes aún</Text>
              </View>
            }
          />

          {isTyping && <TypingIndicator />}
        </>
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ChatInput
          value={messageText}
          onChange={setMessageText}
          onSend={handleSendMessage}
          loading={isSending}
        />
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
