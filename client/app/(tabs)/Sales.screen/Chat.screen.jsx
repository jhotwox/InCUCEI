import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import {
  ActivityIndicator,
  Avatar,
  IconButton,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper"
import Animated, { FadeInLeft, FadeInRight } from "react-native-reanimated"
import { Background } from "../../../components"
import { useAuth } from "../../../contexts/Auth.context"
import { useMessages } from "../../../hooks/useMessages"
import { createFileObjectFromUrl } from "../../../utils/generateFileObjectFromURL"
import Header from "../../../components/common/Header"

const MessageItem = memo(({ item, theme, isOwn, index, myAvatarUri, otherAvatarUri, mode }) => {
  if (!item) return null

  const AnimatedView = Animated.createAnimatedComponent(View)

  return (
    <AnimatedView
      entering={isOwn ? FadeInRight.delay(index * 40) : FadeInLeft.delay(index * 40)}
      style={[styles.messageContainer, isOwn ? styles.userMessage : styles.commerceMessage]}
    >
      {!isOwn && (
        otherAvatarUri ? (
          <Avatar.Image size={32} source={{ uri: otherAvatarUri }} style={styles.avatar} />
        ) : (
          <Avatar.Icon
            size={32}
            icon={mode === "commerce" ? "account" : "store"}
            style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}
            color={theme.colors.primary}
          />
        )
      )}

      <Surface
        elevation={isOwn ? 2 : 1}
        style={[
          styles.messageCard,
          isOwn ? styles.userCard : styles.commerceCard,
        ]}
      >
        <LinearGradient
          colors={
            isOwn
              ? [theme.colors.primary, theme.colors.secondary]
              : ["#ffffff", "#f8f9fa"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          <Text style={[styles.messageText, isOwn ? styles.userText : styles.commerceText]}>
            {item.content}
          </Text>
          <Text style={[styles.timestamp, isOwn && styles.myTimestamp]}>
            {new Date(item.createdAt).toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </LinearGradient>
      </Surface>

      {isOwn && (
        myAvatarUri ? (
          <Avatar.Image size={32} source={{ uri: myAvatarUri }} style={styles.avatar} />
        ) : (
          <Avatar.Icon
            size={32}
            icon={mode === "commerce" ? "store" : "account"}
            style={[styles.avatar, { backgroundColor: theme.colors.secondaryContainer }]}
            color={theme.colors.secondary}
          />
        )
      )}
    </AnimatedView>
  )
})

export default function ChatScreen() {
  const {
    commerceId: commerceIdParam,
    commerceName,
    commerceLogoUrl: commerceLogoUrlParam,
    mode: modeParam,
    chatUserId: chatUserIdParam,
    chatUserEmail,
    chatUserName,
    chatUserProfileUrl: chatUserProfileUrlParam,
  } = useLocalSearchParams()

  const mode = useMemo(() => {
    const raw = Array.isArray(modeParam) ? modeParam[0] : modeParam
    return raw === "commerce" ? "commerce" : "user"
  }, [modeParam])

  const chatUserId = useMemo(
    () => (Array.isArray(chatUserIdParam) ? chatUserIdParam[0] : chatUserIdParam),
    [chatUserIdParam]
  )
  const commerceId = useMemo(
    () => (Array.isArray(commerceIdParam) ? commerceIdParam[0] : commerceIdParam),
    [commerceIdParam]
  )

  const commerceLogoUrl = useMemo(
    () => (Array.isArray(commerceLogoUrlParam) ? commerceLogoUrlParam[0] : commerceLogoUrlParam),
    [commerceLogoUrlParam]
  )

  const chatUserProfileUrl = useMemo(
    () => (Array.isArray(chatUserProfileUrlParam) ? chatUserProfileUrlParam[0] : chatUserProfileUrlParam),
    [chatUserProfileUrlParam]
  )

  const [inputMessage, setInputMessage] = useState("")
  const [profileImageKey, setProfileImageKey] = useState(Date.now())
  const flatListRef = useRef(null)

  const theme = useTheme()
  const { user, profileImageChanged, setProfileImageChanged } = useAuth()
  const {
    messages,
    sendMessage,
    sendCommerceMessage,
    loading,
    markAsRead,
    markCommerceAsRead,
    loadConversation,
    loadCommerceConversation,
  } = useMessages()

  useEffect(() => {
    if (user?.profileUrl) {
      setProfileImageKey(Date.now())
      if (profileImageChanged) setProfileImageChanged(false)
    }
  }, [user?.profileUrl, profileImageChanged, setProfileImageChanged])

  const commerceAvatarUri = useMemo(() => {
    if (!commerceLogoUrl) return null
    return createFileObjectFromUrl(commerceLogoUrl, "logo")?.uri || null
  }, [commerceLogoUrl])

  const userAvatarUri = useMemo(() => {
    if (!user?.profileUrl) return null
    const base = createFileObjectFromUrl(user.profileUrl, "profile")?.uri
    if (!base) return null
    const joiner = base.includes("?") ? "&" : "?"
    return `${base}${joiner}t=${profileImageKey}`
  }, [user?.profileUrl, profileImageKey])

  const chatUserAvatarUri = useMemo(() => {
    if (!chatUserProfileUrl) return null
    return createFileObjectFromUrl(chatUserProfileUrl, "profile")?.uri || null
  }, [chatUserProfileUrl])

  const myAvatarUri = mode === "commerce" ? commerceAvatarUri : userAvatarUri
  const otherAvatarUri = mode === "commerce" ? chatUserAvatarUri : commerceAvatarUri

  const roomUserId = mode === "commerce" ? chatUserId : user?.id

  const roomId = useMemo(() => {
    if (!roomUserId || !commerceId) return null
    return `user_${roomUserId}_commerce_${commerceId}`
  }, [roomUserId, commerceId])

  useEffect(() => {
    if (!commerceId || !roomId) return

    if (mode === "commerce") {
      if (!chatUserId) return
      loadCommerceConversation(commerceId, chatUserId)
      markCommerceAsRead(commerceId, chatUserId)
    } else {
      loadConversation(commerceId)
      markAsRead(commerceId)
    }
    return undefined
  }, [
    commerceId,
    roomId,
    mode,
    chatUserId,
    loadConversation,
    loadCommerceConversation,
    markAsRead,
    markCommerceAsRead,
  ])

  const orderedMessages = useMemo(() => {
    // API returns ascending; with inverted FlatList we want latest at bottom.
    return [...messages].reverse()
  }, [messages])

  const handleSendMessage = useCallback(async () => {
    if (!commerceId) return
    if (!inputMessage.trim() || loading) return

    const messageContent = inputMessage.trim()
    setInputMessage("")

    try {
      const newMessage =
        mode === "commerce"
          ? await sendCommerceMessage(commerceId, chatUserId, messageContent, "text")
          : await sendMessage(commerceId, messageContent, "text")
    } catch (err) {
      console.error("Error sending message:", err)
    }
  }, [
    commerceId,
    inputMessage,
    loading,
    roomId,
    mode,
    chatUserId,
    sendMessage,
    sendCommerceMessage,
  ])

  const renderMessage = useCallback(
    ({ item, index }) => {
      const senderId = typeof item?.sender === "string" ? item.sender : item?.sender?._id
      const isOwn = senderId === user?.id

      return (
        <MessageItem
          item={item}
          theme={theme}
          isOwn={isOwn}
          index={index}
          myAvatarUri={myAvatarUri}
          otherAvatarUri={otherAvatarUri}
          mode={mode}
        />
      )
    },
    [theme, user?.id, myAvatarUri, otherAvatarUri, mode]
  )

  const keyExtractor = useCallback((item, index) => item?._id?.toString?.() || `msg-${index}`, [])

  if (!commerceId) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <Text>No se encontró el comercio.</Text>
      </View>
    )
  }

  if (mode === "commerce" && !chatUserId) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <Text>No se encontró el usuario del chat.</Text>
      </View>
    )
  }

  if (loading && messages.length === 0) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 80}
    >
      <Background background={theme.colors.onPrimary} />

      <Header
        title={mode === "commerce" ? (chatUserName || "Usuario") : (commerceName || "Comercio")}
        subtitle={mode === "commerce" ? chatUserEmail : "Chat"}
        avatarUri={otherAvatarUri}
        icon={mode === "commerce" ? "account" : "store"}
        theme={theme}
        paddingTop={12}
        leftButton={{
          icon: "arrow-left",
          onPress: () => {
            router.push({pathname: mode === "commerce" ? "/(tabs)/Sales.screen/CommerceChatList.screen" : "/(tabs)/Sales.screen/ChatList.screen"})
          }
        }}
      />

      <FlatList
        ref={flatListRef}
        data={orderedMessages}
        renderItem={renderMessage}
        keyExtractor={keyExtractor}
        inverted={true}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={15}
      />

      <View style={styles.inputContainer}>
        <Surface style={styles.inputWrapper} elevation={2}>
          <TextInput
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#999"
            style={styles.textInput}
            mode="flat"
            multiline
            maxLength={1000}
            disabled={loading}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            contentStyle={styles.textInputContent}
            cursorColor={theme.colors.tertiary}
          />
          <IconButton
            icon={loading ? "dots-horizontal" : "send"}
            mode="contained"
            onPress={handleSendMessage}
            disabled={!inputMessage.trim() || loading}
            style={styles.sendButton}
            iconColor="#fff"
            containerColor={!inputMessage.trim() || loading ? "#ccc" : theme.colors.primary}
            size={24}
            animated
          />
        </Surface>
      </View>
    </KeyboardAvoidingView>
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
    paddingTop: 12,
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
  messagesList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  messagesContent: {
    paddingBottom: 16,
    paddingTop: 8,
  },
  messageContainer: {
    marginVertical: 6,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  userMessage: {
    justifyContent: "flex-end",
  },
  commerceMessage: {
    justifyContent: "flex-start",
  },
  messageCard: {
    maxWidth: "75%",
    borderRadius: 20,
    overflow: "hidden",
  },
  userCard: {
    borderBottomRightRadius: 4,
  },
  commerceCard: {
    borderBottomLeftRadius: 4,
    backgroundColor: "#fff",
  },
  gradientContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageText: {
    lineHeight: 20,
    fontSize: 15,
  },
  userText: {
    color: "#fff",
  },
  commerceText: {
    color: "#1a1a1a",
  },
  myTimestamp: {
    color: "rgba(255,255,255,0.8)",
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 6,
    fontWeight: "500",
  },
  avatar: {
    marginHorizontal: 6,
  },
  inputContainer: {
    backgroundColor: "transparent",
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 10,
  },
  textInput: {
    flex: 1,
    maxHeight: 120,
    minHeight: 40,
    backgroundColor: "transparent",
    fontSize: 15,
    paddingHorizontal: 0,
  },
  textInputContent: {
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f5f5f5",
    borderRadius: 36,
    paddingLeft: 16,
    paddingRight: 4,
    paddingTop: 2,
    minHeight: 32,
  },
  sendButton: {
    margin: 0,
    marginLeft: 4,
    marginRight: 6,
    marginBottom: 9,
  },
})
