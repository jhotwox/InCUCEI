import { memo, useCallback } from "react"
import { Pressable, StyleSheet, View, FlatList } from "react-native"
import { router, useFocusEffect } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import { Avatar, Badge, Surface, Text, useTheme } from "react-native-paper"
import { Background } from "../../../components"
import { useMessages } from "../../../hooks/useMessages"

const ChatItem = memo(({ item, onPress, theme }) => {
  const commerce = item?.commerceInfo
  const lastMessage = item?.lastMessage

  const title = commerce?.name || "Comercio"
  const subtitle = lastMessage?.content || ""
  const dateText = lastMessage?.createdAt
    ? new Date(lastMessage.createdAt).toLocaleString("es-MX")
    : ""

  const unreadCount = item?.unreadCount || 0

  return (
    <Pressable onPress={onPress} style={styles.itemPressable}>
      <Surface elevation={2} style={styles.itemSurface}>
        <View style={styles.itemRow}>
          {commerce?.logoUrl ? (
            <Avatar.Image size={44} source={{ uri: commerce.logoUrl }} />
          ) : (
            <Avatar.Icon
              size={44}
              icon="store"
              style={{ backgroundColor: theme.colors.primaryContainer }}
              color={theme.colors.primary}
            />
          )}

          <View style={styles.itemTextCol}>
            <View style={styles.itemTitleRow}>
              <Text variant="titleMedium" numberOfLines={1} style={styles.itemTitle}>
                {title}
              </Text>
              {!!unreadCount && <Badge size={20}>{unreadCount}</Badge>}
            </View>
            <Text variant="bodySmall" numberOfLines={1} style={styles.itemSubtitle}>
              {subtitle}
            </Text>
            <Text variant="labelSmall" numberOfLines={1} style={styles.itemDate}>
              {dateText}
            </Text>
          </View>
        </View>
      </Surface>
    </Pressable>
  )
})

export default () => {
  const theme = useTheme()
  const { chats, loadChats, loading } = useMessages()

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

  return (
    <View style={styles.container}>
      <Background background={theme.colors.onPrimary} />

      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <BlurView intensity={20} tint="light" style={styles.blurHeader}>
          <View style={styles.headerContent}>
            <Avatar.Icon
              size={40}
              icon="chat"
              style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
              color="#fff"
            />
            <View style={styles.headerTextContainer}>
              <Text variant="titleLarge" style={styles.headerTitle}>
                Chats
              </Text>
              <Text variant="bodySmall" style={styles.headerSubtitle}>
                Tus conversaciones con comercios
              </Text>
            </View>
          </View>
        </BlurView>
      </LinearGradient>

      <FlatList
        data={chats}
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
