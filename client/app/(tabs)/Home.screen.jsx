import { useState, useRef, useCallback, memo, useEffect } from "react"
import { View, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from "react-native"
import {
  TextInput,
  IconButton,
  Text,
  ActivityIndicator,
  useTheme,
  Avatar,
  Surface,
} from "react-native-paper"
import Animated, {
  FadeInLeft,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
} from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import { router } from "expo-router"
import { Background, MarkdownText } from "../../components"
import useChatbot from "../../hooks/useChatBot"
import { useAuth } from "../../contexts/Auth.context"
import { useToast } from "../../contexts/Toast.context"
import { createFileObjectFromUrl } from "../../utils/generateFileObjectFromURL"
import Header from "../../components/common/Header"
import { useLayout } from "../../layout/providers.layout"

const MessageItem = memo(({ item, theme, profileUrl, index, profileImageKey }) => {
  if (!item) return null

  const AnimatedView = Animated.createAnimatedComponent(View)
  const uri = item.isUser && profileUrl
  ? `${createFileObjectFromUrl(profileUrl, "profile")?.uri}?t=${profileImageKey}`
  : null

  return (
    <AnimatedView
      entering={item.isUser ? FadeInRight.delay(index * 50) : FadeInLeft.delay(index * 50)}
      style={[
        styles.messageContainer,
        item.isUser ? styles.userMessage : styles.botMessage,
      ]}
    >
      {!item.isUser && (
        <Avatar.Icon
          size={32}
          icon="robot"
          style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}
          color={theme.colors.primary}
        />
      )}
      <Surface
        elevation={item.isUser ? 2 : 1}
        style={[
          styles.messageCard,
          item.isUser ? styles.userCard : styles.botCard,
          item.isError && styles.errorCard,
        ]}
      >
        <LinearGradient
          colors={
            item.isUser
              ? [theme.colors.primary, theme.colors.secondary]
              : item.isError
              ? ["#ffebee", "#ffcdd2"]
              : ["#ffffff", "#f8f9fa"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          {item.isUser ? (
            <Text style={[styles.messageText, styles.userText]}>
              {item.text}
            </Text>
          ) : (
            <MarkdownText style={[styles.messageText, styles.botText]}>
              {item.text}
            </MarkdownText>
          )}
          <Text style={[styles.timestamp, item.isUser && styles.myTimestamp]}>
            {item.timestamp.toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </LinearGradient>
      </Surface>

      {item.isUser && !profileUrl && (
        <Avatar.Icon
          size={32}
          icon="account-circle"
          style={[styles.avatar, { backgroundColor: theme.colors.secondaryContainer }]}
          color={theme.colors.secondary}
        />
      )}
      {item.isUser && profileUrl && (
        <Avatar.Image
          size={32}
          source={{ uri: uri }}
          style={[styles.avatar, { backgroundColor: theme.colors.secondaryContainer }]}
        />
      )}
    </AnimatedView>
  )
})

const TypingIndicator = memo(() => {
  const dot1 = useSharedValue(0)
  const dot2 = useSharedValue(0)
  const dot3 = useSharedValue(0)

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withSpring(1, { damping: 2 }),
        withSpring(0, { damping: 2 })
      ),
      -1
    )
    dot2.value = withRepeat(
      withSequence(
        withSpring(0),
        withSpring(1, { damping: 2 }),
        withSpring(0, { damping: 2 })
      ),
      -1
    )
    dot3.value = withRepeat(
      withSequence(
        withSpring(0),
        withSpring(0),
        withSpring(1, { damping: 2 }),
        withSpring(0, { damping: 2 })
      ),
      -1
    )
  }, [])

  const animatedStyle1 = useAnimatedStyle(() => ({
    opacity: dot1.value,
    transform: [{ translateY: dot1.value * -8 }],
  }))

  const animatedStyle2 = useAnimatedStyle(() => ({
    opacity: dot2.value,
    transform: [{ translateY: dot2.value * -8 }],
  }))

  const animatedStyle3 = useAnimatedStyle(() => ({
    opacity: dot3.value,
    transform: [{ translateY: dot3.value * -8 }],
  }))

  const AnimatedView = Animated.createAnimatedComponent(View)

  return (
    <AnimatedView
      entering={FadeInLeft}
      style={[styles.messageContainer, styles.botMessage]}
    >
      <Avatar.Icon
        size={32}
        icon="robot"
        style={[styles.avatar, { backgroundColor: "#E3F2FD" }]}
        color="#1976D2"
      />
      <Surface elevation={1} style={[styles.messageCard, styles.botCard, styles.typingCard]}>
        <View style={styles.typingContainer}>
          <Animated.View style={[styles.typingDot, animatedStyle1]} />
          <Animated.View style={[styles.typingDot, animatedStyle2]} />
          <Animated.View style={[styles.typingDot, animatedStyle3]} />
        </View>
      </Surface>
    </AnimatedView>
  )
})

export default () => {
  const [inputMessage, setInputMessage] = useState("")
  const [profileImageKey, setProfileImageKey] = useState(Date.now())
  const flatListRef = useRef(null)

  const { messages, sendMessage, loading: chatLoading, isTyping, loadingChatHistory, mapNavigationData, clearMapNavigation } =
    useChatbot()
  const theme = useTheme()
  const { user, profileImageChanged, setProfileImageChanged, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const { tabBarHeight } = useLayout()

  const loading = chatLoading || authLoading
  const profileUrl = user?.profileUrl

  // Actualizar la clave de imagen solo cuando cambie el profileUrl
  useEffect(() => {
    if (profileUrl) {
      setProfileImageKey(Date.now())
      setProfileImageChanged(false)
    }

  }, [profileUrl, profileImageChanged])

  // Manejar navegación al mapa
  useEffect(() => {
    if (mapNavigationData) {
      console.log("[+] Navigating to map with data:", mapNavigationData)

      // Navegar al tab del mapa con los parámetros
      showToast(
        `Mostrar ${mapNavigationData.placeName} en el mapa`,
        "success",
        10000,
        () => {
          router.push({
            pathname: "/(tabs)/Map.screen",
            params: {
              placeId: mapNavigationData.placeId,
              placeName: mapNavigationData.placeName,
              focusPlace: "true", // Pasarlo como string para params
            }
          })

          // Limpiar los datos de navegación después de usarlos
          clearMapNavigation()
        })
    }
  }, [mapNavigationData, clearMapNavigation])


  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || loading) return

    const message = inputMessage.trim()
    setInputMessage("")

    await sendMessage(message).catch(console.error)
  }, [inputMessage, loading, sendMessage])

  const renderMessage = useCallback(({ item, index }) => (
    <MessageItem item={item} theme={theme} profileUrl={profileUrl} index={index} profileImageKey={profileImageKey} />
  ), [theme, profileUrl, profileImageKey])

  const keyExtractor = useCallback((item, index) =>
    item?.id ? item?.id.toString() : `message-${index}`
  , [])

  if (loadingChatHistory)
    return <ActivityIndicator style={{ flex: 1 }} size="large" />

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <Background background={theme.colors.onPrimary} />
      
      <Header
        title="Asistente CUCEI"
        subtitle="Pregúntame lo que necesites"
        theme={theme}
        icon="robot-excited"
        paddingTop={52}
      />

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={keyExtractor}
        inverted={true}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        ListFooterComponent={isTyping ? TypingIndicator : null}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={15}
      />

      <View style={[{ marginBottom: tabBarHeight }, styles.inputContainer]}>
        <Surface style={styles.inputWrapper} elevation={2}>
          <TextInput
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#999"
            style={styles.textInput}
            mode="flat"
            multiline
            maxLength={500}
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
            // onPress={handleToast}
            disabled={!inputMessage.trim() || loading}
            style={styles.sendButton}
            iconColor="#fff"
            containerColor={
              !inputMessage.trim() || loading
                ? "#ccc"
                : theme.colors.primary
            }
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
    paddingTop: 52, // Ajusta el paddingTop para cambiar la altura del header
    paddingBottom: 12, // Ajusta el paddingBottom para el espacio entre el headerAvatar y el borde inferior del header
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
  botMessage: {
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
  botCard: {
    borderBottomLeftRadius: 4,
    backgroundColor: "#fff",
  },
  errorCard: {
    borderWidth: 1,
    borderColor: "#f44336",
  },
  gradientContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageText: {
    lineHeight: 20,
  },
  userText: {
    color: "#fff",
    fontSize: 15,
  },
  botText: {
    color: "#1a1a1a",
    fontSize: 15,
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
  typingCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1976D2",
  },
  inputContainer: {
    backgroundColor: "transparent",
    // backgroundColor: "#f00",
    paddingHorizontal: 12,
    // paddingVertical: 8,
    paddingBottom: Platform.OS === "ios" ? 28 : 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f5f5f5",
    // backgroundColor: "#F0F",
    borderRadius: 36,
    paddingLeft: 16,
    paddingRight: 4,
    paddingTop: 2,
    // paddingVertical: 4,
    minHeight: 32,
  },
  textInput: {
    flex: 1,
    maxHeight: 120,
    minHeight: 40,
    backgroundColor: "transparent",
    // backgroundColor: "#FF0",
    fontSize: 15,
    paddingHorizontal: 0,
  },
  textInputContent: {
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  sendButton: {
    margin: 0,
    marginLeft: 4,
    marginRight: 6,
    marginBottom: 9,
  },
})
