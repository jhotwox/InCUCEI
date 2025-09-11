import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import React from "react";

export default function ChatScreen() {
  const [messages, setMessages] = React.useState([
    { id: "1", text: "¡Hola! Soy tu asistente académico 🤖", sender: "bot" },
  ]);
  const [input, setInput] = React.useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now().toString(), text: input, sender: "user" }]);
    setInput("");
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.sender === "user" ? styles.userMsg : styles.botMsg,
            ]}
          >
            <Text style={{ color: "#fff" }}>{item.text}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu mensaje..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={{ color: "white" }}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ECF0F1" },
  message: {
    margin: 8,
    padding: 12,
    borderRadius: 16,
    maxWidth: "80%",
  },
  userMsg: {
    backgroundColor: "#2980B9",
    alignSelf: "flex-end",
  },
  botMsg: {
    backgroundColor: "#2C3E50",
    alignSelf: "flex-start",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: "#2980B9",
    padding: 12,
    borderRadius: 50,
  },
});
