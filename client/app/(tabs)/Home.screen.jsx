import { useState, useRef, useEffect } from "react"
import { View, FlatList, KeyboardAvoidingView, Platform } from "react-native"
import {
  TextInput,
  Button,
  IconButton,
  Text,
  Card,
  ActivityIndicator,
  useTheme,
} from "react-native-paper"
import useChatbot from "../../hooks/useChatBot"
import { StyleSheet } from "react-native"
import { Background, MarkdownText } from "../../components"

export default () => {
  const [inputMessage, setInputMessage] = useState("")
  const flatListRef = useRef(null)
  
  const { messages, sendMessage, loading, isTyping, loadingChatHistory } =
    useChatbot()
  const theme = useTheme()

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return

    const message = inputMessage.trim()
    setInputMessage("")

    await sendMessage(message).catch(console.error)
  }

  const renderMessage = ({ item }) => {
    if (!item) return null

    return (
      <View
        style={[
          styles.messageContainer,
          item.isUser ? styles.userMessage : styles.botMessage,
        ]}
      >
        <Card
          style={[
            styles.messageCard,
            item.isUser ? { backgroundColor: theme.colors.secondary } : styles.botCard,
            item.isError && styles.errorCard,
          ]}
        >
          <Card.Content>
            {item.isUser ? (
            <Text style={styles.userText}>
              {item.text}
            </Text>
            ) : (
              <MarkdownText style={styles.botText}>
                {item.text}
              </MarkdownText>
            )}
            <Text style={[styles.timestamp, item.isUser && styles.myTimestamp]}>
              {item.timestamp.toLocaleTimeString()}
            </Text>
          </Card.Content>
        </Card>
      </View>
    )
  }

  const renderTypingIndicator = () => {
    if (!isTyping) return null

    return (
      <View style={[styles.messageContainer, styles.botMessage]}>
        <Card style={[styles.messageCard, styles.botCard]}>
          <Card.Content style={styles.typingContainer}>
            <ActivityIndicator size="small" color="#666" />
            <Text style={styles.typingText}>Asistente escribiendo...</Text>
          </Card.Content>
        </Card>
      </View>
    )
  }

  useEffect(() => {
    // Auto-scroll al final cuando hay nuevos mensajes
    flatListRef.current?.scrollToEnd({ animated: true })
  }, [messages])
  // }, [messages, isTyping])

  if (loadingChatHistory)
    return <ActivityIndicator style={{ flex: 1 }} size="large" />

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Background background={theme.colors.onPrimary}/>
      <View style={styles.header}>
        <Text variant="titleLarge">🤖 Asistente CUCEI</Text>
        <Text variant="bodySmall">Tu asistente académico personal</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) =>
          item?.id ? item?.id.toString() : `message-${index}`
        }
        style={styles.messagesList}
        contentContainerStyle={{ paddingBottom: 16 }}
        ListFooterComponent={renderTypingIndicator}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Pregúntame sobre CUCEI..."
          style={styles.textInput}
          multiline
          disabled={loading}
        />
        <IconButton
          icon={loading ? "progress-clock" : "send"}
          mode="contained"
          onPress={handleSendMessage}
          disabled={!inputMessage.trim() || loading}
          style={styles.sendButton}
          iconColor="#FFF"
          containerColor={theme.colors.primary}
        />
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingTop: 32,
  },
  messagesList: {
    flex: 1,
    padding: 8,
    // paddingBottom: 16,
  },
  messageContainer: {
    marginVertical: 4,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  botMessage: {
    alignItems: "flex-start",
  },
  messageCard: {
    maxWidth: "85%",
  },
  userCard: {
    backgroundColor: "#007AFF",
  },
  botCard: {
    backgroundColor: "#fff",
  },
  errorCard: {
    backgroundColor: "#ffebee",
  },
  userText: {
    color: "#fff",
  },
  botText: {
    color: "#333",
  },
  myTimestamp: {
    color: "#f6f6f6",
  },
  timestamp: {
    fontSize: 10,
    opacity: 0.7,
    marginTop: 4,
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingText: {
    marginLeft: 8,
    fontStyle: "italic",
    color: "#666",
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    alignItems: "flex-end",
  },
  textInput: {
    flex: 1,
    height: 32,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    borderRadius: 20
  },
})
