import { useState, useEffect, useCallback, useRef } from "react"
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from "react-native"
import { useLocalSearchParams, useNavigation, useFocusEffect } from "expo-router"
import { Text, ActivityIndicator, useTheme, Appbar, Avatar, Surface } from "react-native-paper"
import { useMessages } from "../../../hooks/useMessages"
import { useSocket } from "../../../contexts/Socket.context"
import { useToast } from "../../../contexts/Toast.context"
import { ChatMessage, ChatInput, TypingIndicator, Background } from "../../../components"

/**
 * ChatDetailScreen - Pantalla que muestra el detalle de una conversación.
 * 
 * Características:
 * - Carga el historial de mensajes de una conversación
 * - Envía nuevos mensajes en tiempo real
 * - Muestra indicador de escritura cuando el otro está escribiendo
 * - Marca mensajes como leídos automáticamente
 * - Scroll automático al último mensaje
 * - Header con info del comercio
 * - Manejo de errores
 * 
 * @screen
 * @returns {JSX.Element}
 */
export default function ChatDetailScreen() {
  const theme = useTheme()
  const { commerceId, commerceName: initialCommerceName } = useLocalSearchParams()
  const navigation = useNavigation()
  const { showToast } = useToast()
  const { socket } = useSocket()
  const flatListRef = useRef(null)

  // Hooks de mensajes
  const { messages, loading, error, sendMessage, loadConversation, markAsRead } = useMessages()

  // Estado local
  const [messageText, setMessageText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [commerceName, setCommerceName] = useState(initialCommerceName || "Chat")

  // Cargar conversación cuando la pantalla entra en foco
  useFocusEffect(
    useCallback(() => {
      if (commerceId) {
        loadConversation(commerceId)
        // Marcar como leídos todos los mensajes de esta conversación
        setTimeout(() => {
          markAsRead(commerceId)
        }, 500)
      }
    }, [commerceId, loadConversation, markAsRead])
  )

  // Escuchar eventos de Socket.IO
  useEffect(() => {
    if (!socket) return

    // Listener para "está escribiendo"
    const handleUserTyping = (data) => {
      if (data?.commerceId === commerceId) {
        setIsTyping(true)
        // Auto-desactivar typing después de 3 segundos
        setTimeout(() => setIsTyping(false), 3000)
      }
    }

    socket.on("userTyping", handleUserTyping)

    return () => {
      socket.off("userTyping", handleUserTyping)
    }
  }, [socket, commerceId])

  // Manejar errores
  useEffect(() => {
    if (error) {
      showToast("Error en la conversación", "error")
      console.error("Error chat: ", error)
    }
  }, [error])

  // Scroll automático al último mensaje cuando hay nuevos
  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true })
    }
  }, [messages])

  // Enviar mensaje
  const handleSendMessage = async () => {
    if (!messageText.trim()) return

    const messageContent = messageText.trim()
    setMessageText("")
    setIsSending(true)

    try {
      await sendMessage(commerceId, messageContent, "text")
      // Scroll al último mensaje
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    } catch (err) {
      // Restaurar el texto si falla
      setMessageText(messageContent)
      showToast("Error al enviar mensaje", "error")
      console.error("Error sending message: ", err)
    } finally {
      setIsSending(false)
    }
  }

  // Header personalizado con info del comercio
  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Avatar.Text
            size={40}
            label={commerceName?.charAt(0).toUpperCase() || "C"}
            style={{
              backgroundColor: theme.colors.primaryContainer,
              marginHorizontal: 8,
            }}
            color={theme.colors.primary}
          />
          <View style={{ flex: 1 }}>
            <Text
              variant="titleMedium"
              style={{ fontWeight: "bold" }}
              numberOfLines={1}
            >
              {commerceName || "Chat"}
            </Text>
            {isTyping && (
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.primary }}
              >
                escribiendo...
              </Text>
            )}
          </View>
        </Appbar.Header>
      ),
    })
  }, [navigation, commerceName, isTyping, theme])

  // Renderizar un mensaje
  const renderMessageItem = ({ item, index }) => (
    <ChatMessage
      key={item._id || index}
      text={item.content}
      isUser={true} // TODO: Obtener del contexto de Auth quién es el usuario actual
      timestamp={item.createdAt}
      isRead={item.isRead}
      index={index}
    />
  )

  // Footer con typing indicator si está escribiendo
  const renderFooter = () => {
    if (!isTyping) return null
    return (
      <Surface
        style={[
          styles.typingContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <TypingIndicator />
      </Surface>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Background />

      {/* Contenido principal */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <>
          {/* Lista de mensajes */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item._id || Math.random().toString()}
            ListFooterComponent={renderFooter}
            onEndReachedThreshold={0.1}
            scrollEnabled={true}
            contentContainerStyle={{
              paddingVertical: 12,
              flexGrow: 1,
            }}
          />

          {/* Input de mensaje */}
          <ChatInput
            value={messageText}
            onChange={setMessageText}
            onSend={handleSendMessage}
            loading={isSending}
            disabled={!commerceId}
          />
        </>
      )}
    </KeyboardAvoidingView>
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

  typingContainer: {
    paddingVertical: 8,
    borderTopWidth: 1,
  },
})
