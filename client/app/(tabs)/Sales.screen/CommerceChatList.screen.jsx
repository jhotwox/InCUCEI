import { useCallback, useMemo, useState } from "react"
import { StyleSheet, View, FlatList } from "react-native"
import { router, useFocusEffect } from "expo-router"
import {
  ActivityIndicator,
  Text,
  useTheme,
} from "react-native-paper"
import { Background, ChatItem, SearchInput } from "../../../components"
import { useToast } from "../../../contexts/Toast.context"
import { useMessages } from "../../../hooks/useMessages"
import { getCommerce } from "../../../api/commerce.api"
import { createFileObjectFromUrl } from "../../../utils/generateFileObjectFromURL"
import Header from "../../../components/common/Header"


export default () => {
  const theme = useTheme()
  const { commerceChats, loadCommerceChats, loading } = useMessages()
  const { showToast } = useToast()

  const [hasCommerce, setHasCommerce] = useState(true)
  const [checkingCommerce, setCheckingCommerce] = useState(true)
  const [search, setSearch] = useState("")

  const verifyCommerceAndLoad = useCallback(async () => {
    try {
      setCheckingCommerce(true)
      await getCommerce()
      setHasCommerce(true)
      await loadCommerceChats()
    } catch (err) {
      const message = typeof err?.message === "string" ? err.message : ""
      if (message === "Comercio no encontrado") {
        setHasCommerce(false)
        return
      }

      setHasCommerce(false)
      showToast("No se pudo verificar tu comercio", "error")
    } finally {
      setCheckingCommerce(false)
    }
  }, [loadCommerceChats, showToast])

  useFocusEffect(
    useCallback(() => {
      verifyCommerceAndLoad()
    }, [verifyCommerceAndLoad]),
  )

  const listData = useMemo(
    () => (hasCommerce ? commerceChats : []),
    [hasCommerce, commerceChats],
  )

  const keyExtractor = useCallback((item, index) => {
    const userId = item?._id
    const commerceId = item?.commerceInfo?._id
    if (userId && commerceId) return `${commerceId}_${userId}`
    return `commerce-chat-${index}`
  }, [])

  const renderItem = useCallback(
    ({ item }) => {
      const sender = item?.senderInfo
      const commerce = item?.commerceInfo
      const commerceId = commerce?._id
      const commerceName = commerce?.name
      const commerceLogoUrl = commerce?.logoUrl
      const chatUserId = sender?._id
      const chatUserEmail = sender?.email
      const chatUserName = sender?.name
      const uri = sender?.profileUrl
        ? `${createFileObjectFromUrl(sender?.profileUrl, "profile")?.uri}`
        : null
      const newItem = { ...item, senderInfo: { ...sender, profileUrl: uri } }

      return (
        <ChatItem
          item={newItem}
          theme={theme}
          type="commerce"
          onPress={() => {
            if (!commerceId || !chatUserId) return
            router.push({
              pathname: "/(tabs)/Sales.screen/Chat.screen",
              params: {
                mode: "commerce",
                commerceId: commerceId.toString(),
                commerceName: commerceName || "Comercio",
                commerceLogoUrl: commerceLogoUrl || "",
                chatUserId: chatUserId.toString(),
                chatUserEmail: chatUserEmail || "",
                chatUserName: chatUserName || "",
                chatUserProfileUrl: uri || "",
              },
            })
          }}
        />
      )
    },
    [theme],
  )

  const filteredListData = listData.filter(
    (client) =>
      ["email", "name"].some((attr) =>
        client?.senderInfo[attr]?.toLowerCase().includes(search.toLowerCase())
      )
  )

  return (
    <View style={styles.container}>
      <Background background={theme.colors.onPrimary} />

      <Header
        title="Mis Clientes"
        subtitle="Mensajes recibidos en tu comercio"
        icon="chat"
        theme={theme}
      />

      <View style={{ paddingTop: 12, paddingHorizontal: 12 }}>
        <SearchInput
          search={search}
          setSearch={setSearch}
          placeholder="Buscar cliente"
        />
      </View>

      <FlatList
        data={filteredListData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshing={loading || checkingCommerce}
        onRefresh={verifyCommerceAndLoad}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={12}
        ListEmptyComponent={
          !loading && !checkingCommerce ? (
            <View style={styles.emptyState}>
              <Text variant="bodyMedium">
                {hasCommerce
                  ? "No hay mensajes de clientes"
                  : "No tienes un comercio creado"}
              </Text>
              <Text variant="bodySmall" style={styles.emptyHint}>
                {hasCommerce
                  ? "Cuando un usuario te contacte, aparecerá aquí"
                  : 'Crea tu comercio en la pestaña "Mi Comercio" para recibir mensajes'}
              </Text>
            </View>
          ) : null
        }
      />

      {checkingCommerce && !loading && listData.length === 0 && (
        <ActivityIndicator style={{ paddingVertical: 12 }} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {},
  blurHeader: {
    overflow: "hidden",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 10,
  },
  itemPressable: {
    borderRadius: 16,
    overflow: "hidden",
  },
  itemSurface: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemTextCol: {
    flex: 1,
    minWidth: 0,
  },
  itemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  itemTitle: {
    flex: 1,
  },
  itemSubtitle: {
    marginTop: 2,
    opacity: 0.8,
  },
  itemDate: {
    marginTop: 6,
    opacity: 0.6,
  },
  itemCommerce: {
    marginTop: 6,
    opacity: 0.7,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 24,
    paddingHorizontal: 24,
  },
  emptyHint: {
    marginTop: 6,
    opacity: 0.7,
    textAlign: "center",
  },
})
