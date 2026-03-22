import { View, StyleSheet, TouchableOpacity } from "react-native"
import { Text, Surface, Avatar, useTheme } from "react-native-paper"
import Animated, { FadeInUp } from "react-native-reanimated"
import { useState } from "react"

/**
 * ChatMessage - Componente que renderiza un mensaje individual en el chat.
 * Muestra:
 * - Avatar del remitente
 * - Texto del mensaje con fondo coloreado
 * - Timestamp formateado
 * - Indicador de "leído" (✓✓ para mensajes del usuario)
 * 
 * @component
 * @param {Object} props
 * @param {string} props.text - Contenido del mensaje
 * @param {boolean} props.isUser - true si es mensaje del usuario actual
 * @param {Date|string} props.timestamp - Fecha/hora del mensaje
 * @param {boolean} [props.isRead] - true si el mensaje fue leído
 * @param {string} [props.avatarUrl] - URL de foto del remitente (opcional)
 * @param {string} [props.senderName] - Nombre del remitente (opcional)
 * @param {number} [props.index] - Índice para animación de entrada
 * 
 * @example
 * <ChatMessage 
 *   text="Hola, ¿cómo estás?"
 *   isUser={true}
 *   timestamp={new Date()}
 *   isRead={true}
 *   index={0}
 * />
 * 
 * @returns {JSX.Element}
 */
export default function ChatMessage({
  text,
  isUser,
  timestamp,
  isRead = false,
  avatarUrl,
  senderName = "Usuario",
  index = 0,
}) {
  const theme = useTheme()

  // Formatear timestamp
  const formatTime = (date) => {
    try {
      const d = new Date(date)
      const hours = String(d.getHours()).padStart(2, "0")
      const minutes = String(d.getMinutes()).padStart(2, "0")
      return `${hours}:${minutes}`
    } catch (e) {
      return ""
    }
  }

  const time = formatTime(timestamp)

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 30)}
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.otherContainer,
      ]}
    >
      {/* Avatar (solo para mensajes del otro) */}
      {!isUser && (
        <Avatar.Text
          size={32}
          label={senderName.charAt(0).toUpperCase()}
          style={{
            backgroundColor: theme.colors.primaryContainer,
            marginRight: 8,
          }}
          color={theme.colors.primary}
        />
      )}

      {/* Burbuja del mensaje */}
      <Surface
        elevation={1}
        style={[
          styles.messageBubble,
          isUser
            ? {
                backgroundColor: theme.colors.primary,
                borderBottomRightRadius: 4,
              }
            : {
                backgroundColor: theme.colors.surfaceVariant,
                borderBottomLeftRadius: 4,
              },
        ]}
      >
        {/* Nombre del remitente (para mensajes de otros) */}
        {!isUser && (
          <Text
            style={[
              styles.senderName,
              { color: theme.colors.primary },
            ]}
            numberOfLines={1}
          >
            {senderName}
          </Text>
        )}

        {/* Texto del mensaje */}
        <Text
          style={[
            styles.messageText,
            {
              color: isUser ? "#fff" : theme.colors.onSurface,
            },
          ]}
        >
          {text}
        </Text>

        {/* Timestamp + indicador de leído */}
        <View style={styles.footer}>
          <Text
            style={[
              styles.timestamp,
              {
                color: isUser ? "rgba(255,255,255,0.7)" : theme.colors.onSurfaceVariant,
              },
            ]}
          >
            {time}
          </Text>
          {isUser && isRead && (
            <Text
              style={[
                styles.readIndicator,
                {
                  color: "rgba(255,255,255,0.7)",
                },
              ]}
            >
              ✓✓
            </Text>
          )}
        </View>
      </Surface>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 6,
    marginHorizontal: 12,
  },

  userContainer: {
    justifyContent: "flex-end",
  },

  otherContainer: {
    justifyContent: "flex-start",
  },

  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },

  senderName: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },

  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },

  timestamp: {
    fontSize: 11,
  },

  readIndicator: {
    fontSize: 11,
    fontWeight: "600",
  },
})
