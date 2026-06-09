import { useCallback, useState } from "react"
import { StyleSheet, View, FlatList } from "react-native"
import { router, useFocusEffect } from "expo-router"
import { Text, useTheme } from "react-native-paper"
import { Background, ChatItem, SearchInput } from "../../../components"
import { useMessages } from "../../../hooks/useMessages"
import Header from "../../../components/common/Header"
import { useLayout } from "../../../layout/providers.layout"

export default () => {
  const [search, setSearch] = useState("")
  
  const theme = useTheme()
  const { chats, loadChats, loading } = useMessages()
  const { tabBarHeight } = useLayout()

  useFocusEffect(
    useCallback(() => {
      loadChats()
    }, [loadChats])
  )

  const keyExtractor = useCallback((item, index) => {
    const commerceId = item?.commerceInfo?._id || item?._id
    return commerceId ? commerceId.toString() : `chat-${index}`
  }, [])

  const renderItem = useCallback(
    ({ item }) => {
      const commerce = item?.commerceInfo
      const commerceId = commerce?._id || item?._id
      const commerceName = commerce?.name
      const commerceLogoUrl = commerce?.logoUrl

      return (
        <ChatItem
          item={item}
          theme={theme}
          type="client"
          onPress={() => {
            if (!commerceId) return
            router.push({
              pathname: "/(tabs)/Sales.screen/Chat.screen",
              params: {
                mode: "user",
                commerceId: commerceId.toString(),
                commerceName: commerceName || "Comercio",
                commerceLogoUrl: commerceLogoUrl || "",
              },
            })
          }}
        />
      )
    },
    [theme]
  )

  const filteredChats = chats.filter(
    (chat) =>
      ["name"].some((attr) =>
        chat?.commerceInfo[attr]?.toLowerCase().includes(search.toLowerCase())
      )
  )

  return (
    <View style={styles.container}>
      <Background background={theme.colors.onPrimary} />

      <Header
        title="Mis Chats"
        subtitle="Tus conversaciones con comercios"
        icon="chat"
        theme={theme}
      />

      <View style={{ paddingTop: 12, paddingHorizontal: 12 }}>
        <SearchInput
          search={search}
          setSearch={setSearch}
          placeholder="Buscar comercio"
        />
      </View>

      <FlatList
        data={filteredChats}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshing={loading}
        onRefresh={loadChats}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={12}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text variant="bodyMedium">No hay chats disponibles</Text>
              <Text variant="bodySmall" style={styles.emptyHint}>
                Ve a Tienda y presiona "Contactar" en un comercio
              </Text>
            </View>
          ) : null
        }
        style={{ marginBottom: tabBarHeight }}
      />
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
