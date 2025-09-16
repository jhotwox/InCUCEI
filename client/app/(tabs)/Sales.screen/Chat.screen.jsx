import { useEffect, useRef, useState } from "react"
import { useAuth } from "../../../contexts/Auth.context"
import { useSocket } from "../../../contexts/Socket.context"
import { useMessages } from "../../../hooks/useMessages"
import { Button, Card, Text, TextInput } from "react-native-paper"
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native"
import { useLocalSearchParams } from "expo-router"

export default function ChatScreen () {
  const { commerceId, commerceName, commerceUserId } = useLocalSearchParams()
  const [inputMessage, setInputMessage] = useState("")
  const flatListRef = useRef(null)

  const { user } = useAuth()
  const { joinRoom, leaveRoom } = useSocket()
  const {
    messages,
    sendMessage,
    loading,
    markAsRead,
    loadConversation,
  } = useMessages()

  const roomId = `user_${user.id}_commerce_${commerceId}`

  useEffect(() => {
    console.log("Initilizing chat with:", { commerceId, commerceName })
    console.log("Generated roomId:", roomId)
    
    loadConversation(commerceId)
    
    joinRoom(roomId)

    markAsRead(roomId)

    return () => {
      leaveRoom(roomId)
    }
  }, [roomId, commerceId])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const messageContent = inputMessage.trim()
    setInputMessage("")

    try {
      await sendMessage(commerceId, messageContent, "text")

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    } catch (err) {
      console.error("Error sending message:", err)
    }
  }

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.sender._id === user.id || item.sender === user.id

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <Card
          style={[
            styles.messageCard,
            isOwnMessage ? styles.myMessageCard : styles.theirMessageCard,
          ]}
        >
          <Card.Content>
            <Text>{item.content}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.createdAt).toLocaleTimeString()}
            </Text>
          </Card.Content>
        </Card>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <Text>Cargando mensajes...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text variant="titleLarge">{commerceName}</Text>
        <Text variant="titleLarge">Conversación con comercio</Text>
      </View>

      <FlatList
        ref={flatListRef}
        // data={messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        style={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Escribe un mensaje..."
          style={styles.textInput}
          multiline
          maxLength={1000}
        />
        <Button
          mode="contained"
          onPress={handleSendMessage}
          disabled={!inputMessage.trim() || loading}
          style={styles.sendButton}
        >
          Enviar
        </Button>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  messagesList: {
    flex: 1,
    padding: 8,
  },
  messageContainer: {
    marginVertical: 4,
  },
  myMessage: {
    alignSelf: "flex-end",
  },
  theirMessage: {
    alignSelf: "flex-start",
  },
  messageCard: {
    maxWidth: "80%",
  },
  myMessageCard: {
    backgroundColor: "#DCF8C6",
  },
  theirMessageCard: {
    backgroundColor: "#FFF",
  },
  timestamp: {
    fontSize: 10,
    opacity: 0.7,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFF",
    alignItems: "flex-end",
  },
  textInput: {
    flex: 1,
    marginRight: 8,
  },
  sendButton: {
    minWidth: 80,
  },
})
