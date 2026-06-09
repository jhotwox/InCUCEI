import { useState, useEffect, useCallback } from "react"
import { View, FlatList, StyleSheet, RefreshControl } from "react-native"
import { Text, ActivityIndicator, useTheme } from "react-native-paper"
import { useMessages } from "../../../hooks/useMessages"
import { ChatListItem } from "../../../components"
import { useToast } from "../../../contexts/Toast.context"
import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native"
import { Background } from "../../../components"
import { getCommerce } from "../../../api/commerce.api"
import { useAuth } from "../../../contexts/Auth.context"

/**
 * VentasTabScreen - Pantalla que muestra conversaciones de entrada al negocio del usuario
 * 
 * Características:
 * - Carga chats de negocios donde el usuario es el propietario
 * - Filtra automáticamente chats para mostrar solo los del negocio del usuario
 * - Refresco manual con swipe-down
 * - Indicador de carga
 * - Mensaje vacío si no hay clientes contactando
 * 
 * @screen
 * @requires user.commerce
 * @returns {JSX.Element}
 */
export default function VentasTabScreen() {
  const theme = useTheme()
  const navigation = useNavigation()
  const route = useRoute()
  const { showToast } = useToast()
  const { user } = useAuth()
  
  // Detectar si estamos dentro de un tab (no mostrar header) o como pantalla principal (mostrar header)
  const isWithinTabs = route.name !== "index" && route.name !== undefined

  // Hook para obtener chats de comercio
  const { chats, loading, error, loadChats } = useMessages()
  const [refreshing, setRefreshing] = useState(false)
  const [userCommerceId, setUserCommerceId] = useState(null)

  // Obtener el ID del comercio del usuario para filtrar chats
  useEffect(() => {
    const fetchUserCommerce = async () => {
      try {
        const response = await getCommerce()
        if (response?.data?.commerce?._id) {
          setUserCommerceId(response.data.commerce._id)
        }
      } catch (err) {
        console.error("Error getting user commerce:", err)
        setUserCommerceId(null)
      }
    }

    if (user?.id) {
      fetchUserCommerce()
    }
  }, [user?.id])

  // Filtrar chats para mostrar solo los que van dirigidos al negocio del usuario
  const ownCommerceChats = userCommerceId
    ? chats.filter(chat => chat._id === userCommerceId)
    : []

  // Cargar chats cuando la pantalla entra en foco
  useFocusEffect(
    useCallback(() => {
      loadChats()
    }, [loadChats])
  )

  // Manejar errores
  useEffect(() => {
    if (error) {
      showToast("Error al cargar ventas", "error")
      console.error("Error loadChats: ", error)
    }
  }, [error])

  // Refresh manual (swipe-down)
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadChats()
      showToast("Chats actualizados", "success", 2000)
    } catch (err) {
      showToast("Error al actualizar", "error")
    } finally {
      setRefreshing(false)
    }
  }

  // Navegar a detalle de chat de comercio
  const handleChatPress = (chat) => {
    if (!chat?._id) return
    navigation.navigate("[commerceId]", {
      commerceId: chat._id,
      commerceName: chat.commerceInfo?.name || "Chat",
      isPrivateChat: false,
    })
  }

  // Item vacío
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
        Sin mensajes de clientes
      </Text>
      <Text style={[styles.emptySubText, { color: theme.colors.onSurfaceVariant }]}>
        Los clientes que contacten tu negocio aparecerán aquí
      </Text>
    </View>
  )

  // Renderizar item de chat
  const renderChatItem = ({ item, index }) => {
    if (!item || !item._id) return null

    return (
      <ChatListItem
        key={item._id?.toString()}
        commerceId={item._id?.toString()}
        commerceName={item.commerceInfo?.name || "Mi negocio"}
        lastMessage={item.lastMessage?.content || ""}
        lastMessageTime={item.lastMessage?.createdAt}
        unreadCount={item.unreadCount || 0}
        commerceImageUrl={item.commerceInfo?.logoUrl}
        onPress={() => handleChatPress(item)}
        index={index}
      />
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Background />

      {/* Header - Solo se muestra cuando NO está dentro de tabs */}
      {!isWithinTabs && (
        <View style={styles.header}>
          <Text variant="headlineSmall" style={[styles.headerTitle, { color: theme.colors.onBackground }]}>
            Ventas
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            {ownCommerceChats.length > 0 ? `${ownCommerceChats.length} cliente(s)` : "Sin clientes"}
          </Text>
        </View>
      )}

      {/* Lista de chats */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={ownCommerceChats && Array.isArray(ownCommerceChats) ? ownCommerceChats : []}
          renderItem={renderChatItem}
          keyExtractor={(item) => item?._id?.toString() || Math.random().toString()}
          ListEmptyComponent={renderEmptyState}
          scrollEnabled={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 4,
            paddingTop: 8,
            paddingBottom: 80,
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },

  headerTitle: {
    fontWeight: "700",
    fontSize: 28,
    marginBottom: 6,
    letterSpacing: 0.3,
  },

  headerSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.2,
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
    paddingHorizontal: 32,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 0.3,
  },

  emptySubText: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "400",
    lineHeight: 20,
  },
})
