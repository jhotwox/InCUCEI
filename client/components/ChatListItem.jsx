import { View, StyleSheet, TouchableOpacity } from "react-native"
import { Text, Avatar, Surface, Badge, useTheme } from "react-native-paper"
import Animated, { FadeInLeft } from "react-native-reanimated"

/**
 * ChatListItem - Componente que renderiza un item en la lista de chats/conversaciones.
 * Muestra:
 * - Avatar del comercio o usuario
 * - Nombre del comercio/usuario con indicador de estado
 * - Preview del último mensaje
 * - Timestamp del último mensaje
 * - Badge con cantidad de mensajes sin leer
 * - Indicador visual de mensaje sin leer
 * 
 * @component
 * @param {Object} props
 * @param {string} props.commerceId - ID del comercio
 * @param {string} props.commerceName - Nombre del comercio
 * @param {string} props.lastMessage - Preview del último mensaje
 * @param {Date|string} props.lastMessageTime - Timestamp del último mensaje
 * @param {number} [props.unreadCount] - Cantidad de mensajes sin leer
 * @param {string} [props.commerceImageUrl] - URL de la foto del comercio
 * @param {()=>void} props.onPress - Callback cuando se presiona el item
 * @param {number} [props.index] - Índice para animación de entrada
 * 
 * @returns {JSX.Element}
 */
export default function ChatListItem({
  commerceId,
  commerceName,
  lastMessage,
  lastMessageTime,
  unreadCount = 0,
  commerceImageUrl,
  onPress,
  index = 0,
}) {
  const theme = useTheme()

  // Formatear tiempo relativo (ej: "2 min" o "Ayer" o "10/03")
  const formatTimeAgo = (date) => {
    try {
      const d = new Date(date)
      const now = new Date()
      const diffMs = now - d
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return "Ahora"
      if (diffMins < 60) return `${diffMins}m`
      if (diffHours < 24) return `${diffHours}h`
      if (diffDays === 1) return "Ayer"
      if (diffDays < 7) return `${diffDays}d`
      
      // Si es más de una semana, mostrar fecha
      const day = String(d.getDate()).padStart(2, "0")
      const month = String(d.getMonth() + 1).padStart(2, "0")
      return `${day}/${month}`
    } catch (e) {
      return ""
    }
  }

  const timeAgo = formatTimeAgo(lastMessageTime)

  // Truncar mensaje si es muy largo
  const truncatedMessage = lastMessage
    ? lastMessage.length > 50
      ? lastMessage.substring(0, 50) + "..."
      : lastMessage
    : "Sin mensajes"

  return (
    <Animated.View
      entering={FadeInLeft.delay(index * 50)}
      style={{ marginHorizontal: 8, marginVertical: 6 }}
    >
      <TouchableOpacity 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Surface
          style={[
            styles.container,
            {
              backgroundColor: unreadCount > 0 
                ? theme.colors.surfaceVariant + "40"
                : theme.colors.surface,
              borderLeftColor: unreadCount > 0 
                ? theme.colors.primary
                : "transparent",
            }
          ]}
          elevation={1}
        >
          <View style={styles.content}>
            {/* Avatar con estado visual */}
            <View style={styles.avatarWrapper}>
              {commerceImageUrl ? (
                <Avatar.Image
                  size={56}
                  source={{ uri: commerceImageUrl }}
                  style={styles.avatar}
                />
              ) : (
                <Avatar.Text
                  size={56}
                  label={commerceName.charAt(0).toUpperCase()}
                  style={{
                    ...styles.avatar,
                    backgroundColor: theme.colors.primaryContainer,
                  }}
                  color={theme.colors.primary}
                />
              )}
              {/* Indicador de no leído */}
              {unreadCount > 0 && (
                <View
                  style={[
                    styles.unreadIndicator,
                    { backgroundColor: theme.colors.primary }
                  ]}
                />
              )}
            </View>

            {/* Info de la conversación */}
            <View style={styles.textContainer}>
              {/* Nombre del comercio + tiempo */}
              <View style={styles.header}>
                <Text
                  style={[
                    styles.commerceName,
                    {
                      color: theme.colors.onSurface,
                      fontWeight: unreadCount > 0 ? "700" : "500",
                    }
                  ]}
                  numberOfLines={1}
                  variant="labelLarge"
                >
                  {commerceName}
                </Text>
                <Text
                  style={[
                    styles.time,
                    { 
                      color: theme.colors.onSurfaceVariant,
                      fontWeight: unreadCount > 0 ? "600" : "400",
                    },
                  ]}
                  variant="labelSmall"
                >
                  {timeAgo}
                </Text>
              </View>

              {/* Preview del mensaje */}
              <Text
                style={[
                  styles.message,
                  { 
                    color: unreadCount > 0 
                      ? theme.colors.onSurface 
                      : theme.colors.onSurfaceVariant,
                    fontWeight: unreadCount > 0 ? "500" : "400",
                  },
                ]}
                numberOfLines={2}
                variant="bodySmall"
              >
                {truncatedMessage}
              </Text>
            </View>

            {/* Badge de mensajes sin leer */}
            {unreadCount > 0 && (
              <View style={styles.badgeContainer}>
                <Badge
                  size={28}
                  style={{
                    backgroundColor: theme.colors.primary,
                    fontWeight: "700",
                  }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              </View>
            )}
          </View>
        </Surface>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderLeftWidth: 4,
    borderRadius: 12,
    marginBottom: 2,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  avatarWrapper: {
    position: "relative",
  },

  avatar: {
    borderRadius: 28,
  },

  unreadIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#fff",
  },

  textContainer: {
    flex: 1,
    justifyContent: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  commerceName: {
    flex: 1,
    marginRight: 8,
  },

  time: {
    marginLeft: 8,
    minWidth: 35,
    textAlign: "right",
  },

  message: {
    lineHeight: 18,
  },

  badgeContainer: {
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
})
