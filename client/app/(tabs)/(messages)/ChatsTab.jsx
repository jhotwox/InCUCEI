import { useState, useEffect, useCallback } from "react"
import { View, FlatList, StyleSheet, RefreshControl } from "react-native"
import { Text, ActivityIndicator, useTheme, FAB, Dialog, Portal, TextInput, Button } from "react-native-paper"
import { usePrivateChat } from "../../../hooks/usePrivateChat"
import { useMessages } from "../../../hooks/useMessages"
import { ChatListItem } from "../../../components"
import { useToast } from "../../../contexts/Toast.context"
import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native"
import { Background } from "../../../components"
import { searchUserByEmailRequest } from "../../../api/messages.api"
import { getCommerce } from "../../../api/commerce.api"
import { useAuth } from "../../../contexts/Auth.context"

/**
 * ChatsTabScreen - Pantalla que muestra conversaciones privadas + chats con negocios
 * 
 * Características:
 * - Carga chats privados (usuario-usuario)
 * - Carga chats de negocios (usuario-commerce)
 * - Si el usuario tiene su propio negocio, excluye chats con su propio negocio
 * - Refresco manual con swipe-down
 * - Botón FAB para buscar nuevos usuarios
 * - Indicador de carga
 * 
 * @screen
 * @returns {JSX.Element}
 */
export default function ChatsTabScreen() {
  const theme = useTheme()
  const navigation = useNavigation()
  const route = useRoute()
  const { showToast } = useToast()
  const { user } = useAuth()
  
  // Detectar si estamos dentro de un tab (no mostrar header) o como pantalla principal (mostrar header)
  const isWithinTabs = route.name !== "index" && route.name !== undefined

  // Hooks para obtener chats
  const { privateChats, loading: privateLoading, error: privateError, loadPrivateChats } = usePrivateChat()
  const { chats: commerceChats, loading: commerceLoading, error: commerceError, loadChats } = useMessages()
  
  const [refreshing, setRefreshing] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [searchEmail, setSearchEmail] = useState("")
  const [searching, setSearching] = useState(false)
  const [foundUser, setFoundUser] = useState(null)
  const [userCommerceId, setUserCommerceId] = useState(null)

  const loading = privateLoading || commerceLoading

  // Obtener el ID del comercio del usuario (si lo tiene)
  useEffect(() => {
    const fetchUserCommerce = async () => {
      try {
        const response = await getCommerce()
        if (response?.data?.commerce?._id) {
          setUserCommerceId(response.data.commerce._id)
        }
      } catch (err) {
        // Usuario no tiene comercio
        setUserCommerceId(null)
      }
    }

    if (user?.id) {
      fetchUserCommerce()
    }
  }, [user?.id])

  // Filtrar comercios: excluir el propio negocio del usuario
  const filteredCommerceChats = userCommerceId
    ? commerceChats.filter(chat => chat._id !== userCommerceId)
    : commerceChats

  // Combinar chats privados y de negocios
  const allChats = [
    ...privateChats.map(chat => ({ ...chat, type: 'private' })),
    ...filteredCommerceChats.map(chat => ({ ...chat, type: 'commerce' }))
  ]

  // Cargar chats cuando la pantalla entra en foco
  useFocusEffect(
    useCallback(() => {
      loadPrivateChats()
      loadChats()
    }, [loadPrivateChats, loadChats])
  )

  // Manejar errores
  useEffect(() => {
    if (privateError) {
      showToast("Error al cargar chats privados", "error")
      console.error("Error loadPrivateChats: ", privateError)
    }
  }, [privateError])

  useEffect(() => {
    if (commerceError) {
      showToast("Error al cargar chats de negocios", "error")
      console.error("Error loadChats: ", commerceError)
    }
  }, [commerceError])

  // Refresh manual (swipe-down)
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([loadPrivateChats(), loadChats()])
      showToast("Chats actualizados", "success", 2000)
    } catch (err) {
      showToast("Error al actualizar", "error")
    } finally {
      setRefreshing(false)
    }
  }

  // Navegar a detalle de chat
  const handleChatPress = (chat) => {
    if (chat.type === 'private') {
      navigation.navigate("PrivateChat", {
        otherUserId: chat.otherUser._id,
        otherUserName: chat.otherUser.name || chat.otherUser.email,
      })
    } else {
      navigation.navigate("[commerceId]", {
        commerceId: chat._id,
        commerceName: chat.commerceInfo?.name || "Chat",
        isPrivateChat: false,
      })
    }
  }

  // Buscar usuario por correo
  const handleSearchUser = async () => {
    if (!searchEmail.trim()) {
      showToast("Ingresa un correo válido", "error")
      return
    }

    if (searchEmail === user?.email) {
      showToast("No puedes chatear contigo mismo", "error")
      return
    }

    setSearching(true)
    try {
      const response = await searchUserByEmailRequest(searchEmail)
      if (response.data?.data?.user) {
        setFoundUser(response.data.data.user)
      } else {
        showToast("Usuario no encontrado", "error")
        setFoundUser(null)
      }
    } catch (err) {
      console.error("Error searching user:", err)
      showToast("Error al buscar usuario", "error")
      setFoundUser(null)
    } finally {
      setSearching(false)
    }
  }

  // Iniciar conversación con usuario
  const handleStartConversation = () => {
    if (!foundUser) return

    setModalVisible(false)
    setSearchEmail("")
    setFoundUser(null)

    navigation.navigate("PrivateChat", {
      otherUserId: foundUser._id,
      otherUserName: foundUser.name || foundUser.email,
    })
  }

  // Item vacío
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
        No tienes chats aún
      </Text>
      <Text style={[styles.emptySubText, { color: theme.colors.onSurfaceVariant }]}>
        Busca usuarios o contacta negocios
      </Text>
    </View>
  )

  // Renderizar item de chat
  const renderChatItem = ({ item, index }) => {
    if (!item || !item._id) return null

    const isPrivate = item.type === 'private'
    const displayName = isPrivate
      ? (item.otherUser?.name || item.otherUser?.email || "Usuario")
      : (item.commerceInfo?.name || "Comercio")
    const displayImage = isPrivate
      ? item.otherUser?.profileUrl
      : item.commerceInfo?.logoUrl

    return (
      <ChatListItem
        key={item._id?.toString()}
        commerceId={isPrivate ? item.otherUser._id : item._id?.toString()}
        commerceName={displayName}
        lastMessage={item.lastMessage?.content || ""}
        lastMessageTime={item.lastMessage?.createdAt}
        unreadCount={item.unreadCount || 0}
        commerceImageUrl={displayImage}
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
            Chats
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            {allChats.length > 0 ? `${allChats.length} conversaciones` : "Sin chats"}
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
          data={allChats && Array.isArray(allChats) ? allChats : []}
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

      {/* FAB para crear nuevo chat */}
      <FAB
        icon="plus"
        onPress={() => setModalVisible(true)}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
      />

      {/* Modal para buscar usuario */}
      <Portal>
        <Dialog
          visible={modalVisible}
          onDismiss={() => {
            setModalVisible(false)
            setSearchEmail("")
            setFoundUser(null)
          }}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title>Buscar usuario</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Correo del usuario"
              value={searchEmail}
              onChangeText={setSearchEmail}
              placeholder="usuario@example.com"
              mode="outlined"
              disabled={searching}
              style={{ marginBottom: 16 }}
            />

            {foundUser && (
              <View style={{ 
                padding: 12, 
                backgroundColor: theme.colors.surfaceVariant, 
                borderRadius: 8,
                marginBottom: 16
              }}>
                <Text variant="bodyMedium">
                  <Text style={{ fontWeight: "bold" }}>Usuario encontrado:</Text>
                  {"\n"}{foundUser.name || foundUser.email}
                </Text>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => {
                setModalVisible(false)
                setSearchEmail("")
                setFoundUser(null)
              }}
            >
              Cancelar
            </Button>
            {foundUser ? (
              <Button 
                onPress={handleStartConversation}
                mode="contained"
              >
                Chatear
              </Button>
            ) : (
              <Button 
                onPress={handleSearchUser}
                loading={searching}
                mode="contained"
              >
                Buscar
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>
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

  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    elevation: 8,
  },
})
