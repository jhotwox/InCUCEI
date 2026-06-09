import { View, StyleSheet, TextInput as RNTextInput, TouchableOpacity } from "react-native"
import { Text, IconButton, useTheme, ActivityIndicator } from "react-native-paper"
import { useState, useRef } from "react"

/**
 * ChatInput - Componente para escribir y enviar mensajes en el chat.
 * Características:
 * - Input de texto multi-línea
 * - Botón para enviar (deshabilitado si está vacío)
 * - Indicador visual de carga
 * - Cambio de altura según cantidad de líneas
 * - Teclado personalizado
 * 
 * @component
 * @param {Object} props
 * @param {string} props.value - Valor actual del input
 * @param {(text: string) => void} props.onChange - Callback cuando cambia el texto
 * @param {() => void | Promise<void>} props.onSend - Callback cuando presiona enviar
 * @param {boolean} [props.loading] - true si está enviando
 * @param {boolean} [props.disabled] - true si el input debe estar deshabilitado
 * 
 * @example
 * const [text, setText] = useState("")
 * <ChatInput 
 *   value={text}
 *   onChange={setText}
 *   onSend={async () => {
 *     await sendMessage(text)
 *     setText("")
 *   }}
 *   loading={isSending}
 * />
 * 
 * @returns {JSX.Element}
 */
export default function ChatInput({
  value,
  onChange,
  onSend,
  loading = false,
  disabled = false,
}) {
  const theme = useTheme()
  const inputRef = useRef(null)
  const [isFocused, setIsFocused] = useState(false)

  const handleSend = async () => {
    if (!value.trim() || loading || disabled) return
    
    try {
      await onSend()
    } catch (err) {
      console.error("Error sending message: ", err)
    }
  }

  const isDisabled = !value.trim() || loading || disabled

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.outline,
        },
      ]}
    >
      {/* Input de texto */}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.colors.surfaceVariant,
            borderColor: isFocused ? theme.colors.primary : theme.colors.outline,
          },
        ]}
      >
        <RNTextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              color: theme.colors.onSurface,
            },
          ]}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={value}
          onChangeText={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline
          maxLength={500}
          editable={!disabled && !loading}
          textAlignVertical="center"
        />
      </View>

      {/* Botón enviar */}
      <TouchableOpacity
        onPress={handleSend}
        disabled={isDisabled}
        activeOpacity={0.6}
        style={styles.sendButton}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={theme.colors.primary}
          />
        ) : (
          <IconButton
            icon="send"
            size={20}
            iconColor={isDisabled ? theme.colors.outlineVariant : theme.colors.primary}
            disabled={isDisabled}
            onPress={handleSend}
            style={styles.sendIcon}
          />
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },

  inputWrapper: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
  },

  input: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 40,
    maxHeight: 80,
  },

  sendButton: {
    justifyContent: "center",
    alignItems: "center",
  },

  sendIcon: {
    margin: 0,
  },
})
