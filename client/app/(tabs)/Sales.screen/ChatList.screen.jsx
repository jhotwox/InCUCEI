import { router } from "expo-router"
import { useAuth } from "../../../contexts/Auth.context"
import { useMessages } from "../../../hooks/useMessages"
import { Badge, Card, Text } from "react-native-paper"
import { FlatList, View } from "react-native"
import { useEffect } from "react"

export default () => {
  const { user } = useAuth()
  const { chats, loadChats, loading } = useMessages()

  useEffect(() => {
    loadChats()
  }, [])

  const renderChatItem = ({ item }) => {
    const otherUser =
      item.lastMessage.sender._id === user.id
        ? item.lastMessage.receiver
        : item.lastMessage.sender

    return (
      <TouchableOpacity
        onPress={() => {
          router.push({
            name: "Chat.screen",
            params: {
              chatUserId: otherUser._id,
              chatUserEmail: otherUser.email,
            },
          })
        }}
      >
        <Card style={{ margin: 8 }}>
          <Card.Content>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View style={{ flex: 1 }}>
                <Text variant="titleMedium">{otherUser.email}</Text>
                <Text variant="bodySmall" numberOfLines={1}>
                  {item.lastMessage.content}
                </Text>
                <Text
                  variant="labelSmall"
                  numberOfLines={1}
                  style={{ color: "gray" }}
                >
                  {new Date(item.lastMessage.createdAt).toLocaleString()}
                </Text>
              </View>
              {item.unreadCount > 0 && (
                <Badge size={20}>{item.unreadCount}</Badge>
              )}
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    )
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item._id}
        refreshing={loading}
        onRefresh={loadChats}
        ListEmptyComponent={
          !loading && (
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <Text variant="bodyMedium">No hay chats disponibles</Text>
            </View>
          )
        }
      />
    </View>
  )
}
